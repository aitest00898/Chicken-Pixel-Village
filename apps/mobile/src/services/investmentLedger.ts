import { collection, doc, onSnapshot } from 'firebase/firestore';
import { parseInvestmentRound, type InvestmentLedgerSnapshot, type InvestmentRound } from '../data/investmentLedger';
import { firebaseFirestore } from './firebase';

const emptySnapshot: InvestmentLedgerSnapshot = { updatedOn: null, members: [], rounds: [] };

export function subscribeInvestmentLedger(
  onChange: (snapshot: InvestmentLedgerSnapshot) => void,
  onError: (message: string) => void,
) {
  if (!firebaseFirestore) {
    onChange(emptySnapshot);
    return () => undefined;
  }
  let rounds: InvestmentRound[] = [];
  let updatedOn: string | null = null;
  let members: string[] = [];
  const emit = () => onChange({ updatedOn, members, rounds });
  const unsubscribeRounds = onSnapshot(collection(firebaseFirestore, 'investment_houses'), (snapshot) => {
    rounds = snapshot.docs
      .map((row) => parseInvestmentRound(row.id, row.data()))
      .filter((row): row is InvestmentRound => row !== null)
      .sort((left, right) => left.iconIndex - right.iconIndex);
    emit();
  }, () => onError('無法讀取 Firebase 投資雞舍帳冊。'));
  const unsubscribeMeta = onSnapshot(doc(firebaseFirestore, 'investment_ledger', 'meta'), (snapshot) => {
    const data = snapshot.data();
    updatedOn = typeof data?.updatedOn === 'string' ? data.updatedOn : null;
    members = Array.isArray(data?.members) ? data.members.filter((value): value is string => typeof value === 'string') : [];
    emit();
  }, () => onError('無法讀取 Firebase 投資帳冊索引。'));
  return () => { unsubscribeRounds(); unsubscribeMeta(); };
}
