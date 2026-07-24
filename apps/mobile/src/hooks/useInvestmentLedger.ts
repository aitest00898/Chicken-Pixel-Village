import { useEffect, useState } from 'react';
import type { InvestmentLedgerSnapshot } from '../data/investmentLedger';
import { subscribeInvestmentLedger } from '../services/investmentLedger';

const emptySnapshot: InvestmentLedgerSnapshot = { updatedOn: null, members: [], rounds: [] };

export function useInvestmentLedger(enabled: boolean) {
  const [snapshot, setSnapshot] = useState(emptySnapshot);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setSnapshot(emptySnapshot);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    return subscribeInvestmentLedger((next) => {
      setSnapshot(next);
      setLoading(false);
      setError(null);
    }, (message) => {
      setLoading(false);
      setError(message);
    });
  }, [enabled]);

  return { ...snapshot, loading, error };
}
