import { deleteField, doc, onSnapshot, runTransaction, updateDoc } from 'firebase/firestore';
import { initialVisitProgress, recordVisit, type EquipmentSlot, type VisitProgress } from '@chicken-village/domain';
import { firebaseFirestore } from './firebase';

function taipeiDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return `${read('year')}-${read('month')}-${read('day')}`;
}

function parseProgress(value: Record<string, unknown> | undefined): VisitProgress {
  if (!value) return initialVisitProgress;
  const equipped = value.equipped && typeof value.equipped === 'object' ? value.equipped as VisitProgress['equipped'] : {};
  return {
    accumulatedDays: typeof value.accumulatedDays === 'number' ? Math.max(0, Math.trunc(value.accumulatedDays)) : 0,
    streakDays: typeof value.streakDays === 'number' ? Math.max(0, Math.trunc(value.streakDays)) : 0,
    lastVisitDate: typeof value.lastVisitDate === 'string' ? value.lastVisitDate : null,
    equipped,
  };
}

export function subscribeVisitProgress(ownerUid: string, onChange: (value: VisitProgress) => void, onError: (message: string) => void) {
  if (!firebaseFirestore) return () => undefined;
  return onSnapshot(doc(firebaseFirestore, 'visit_progress', ownerUid), (snapshot) => {
    onChange(parseProgress(snapshot.data()));
  }, () => onError('無法讀取 Firebase 登入日誌。'));
}

export async function recordDailyLogin(ownerUid: string, now = new Date()) {
  if (!firebaseFirestore) throw new Error('Firestore 尚未配置，無法登記登入日期。');
  const date = taipeiDate(now);
  const progressRef = doc(firebaseFirestore, 'visit_progress', ownerUid);
  const dayRef = doc(firebaseFirestore, 'visit_progress', ownerUid, 'days', date);
  await runTransaction(firebaseFirestore, async (transaction) => {
    const [daySnapshot, progressSnapshot] = await Promise.all([transaction.get(dayRef), transaction.get(progressRef)]);
    if (daySnapshot.exists()) return;
    const next = recordVisit(parseProgress(progressSnapshot.data()), date);
    transaction.set(dayRef, { date, recordedAt: now.toISOString() });
    transaction.set(progressRef, { ...next, ownerUid, updatedAt: now.toISOString() }, { merge: true });
  });
}

export async function saveEquippedItem(ownerUid: string, slot: EquipmentSlot, itemId: string | null) {
  if (!firebaseFirestore) throw new Error('Firestore 尚未配置，無法保存行裝。');
  const progressRef = doc(firebaseFirestore, 'visit_progress', ownerUid);
  await updateDoc(progressRef, {
    [`equipped.${slot}`]: itemId === null ? deleteField() : itemId,
    updatedAt: new Date().toISOString(),
  });
}

export { taipeiDate };
