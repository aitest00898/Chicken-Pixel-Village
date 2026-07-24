import type { ChickenHouse } from '@chicken-village/domain';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { firebaseFirestore } from './firebase';

const COLLECTION = 'public_houses';
const species = new Set<ChickenHouse['species']>(['red_feather', 'black_feather', 'broiler', 'layer', 'other']);

function parseHouse(id: string, value: Record<string, unknown>): ChickenHouse | null {
  if (typeof value.name !== 'string' || !species.has(value.species as ChickenHouse['species'])) return null;
  if (typeof value.designCapacity !== 'number' || typeof value.currentBirdCount !== 'number') return null;
  return { ...value, id } as ChickenHouse;
}

export function subscribePublicHouses(onChange: (houses: ChickenHouse[]) => void, onError: (message: string) => void) {
  if (!firebaseFirestore) return () => undefined;
  return onSnapshot(collection(firebaseFirestore, COLLECTION), (snapshot) => {
    const houses = snapshot.docs
      .map((row) => parseHouse(row.id, row.data()))
      .filter((row): row is ChickenHouse => row !== null)
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'));
    onChange(houses);
  }, () => onError('無法讀取公開雞舍資料，暫時顯示本機快取。'));
}

export async function publishPublicHouse(house: ChickenHouse) {
  if (!firebaseFirestore) throw new Error('Firestore 尚未配置，無法寫入公開雞舍資料。');
  await setDoc(doc(firebaseFirestore, COLLECTION, house.id), house);
}
