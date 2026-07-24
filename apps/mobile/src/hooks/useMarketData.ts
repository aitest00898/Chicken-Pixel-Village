import { fetchLatestMoaPoultry, verifiedMarketFixture, type MarketBundle } from '@chicken-village/market-data';
import { useEffect, useState } from 'react';

const fixtureBundle: MarketBundle = {
  records: verifiedMarketFixture,
  snapshots: [],
  mode: 'fixture',
  message: '顯示 2026-07-23 已驗證快照，正在背景確認最新行情',
};

export function useMarketData() {
  const [bundle, setBundle] = useState<MarketBundle>(fixtureBundle);
  const [syncing, setSyncing] = useState(true);
  const [lastAttempt, setLastAttempt] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8_000);
    fetchLatestMoaPoultry(new Date(), controller.signal)
      .then((live) => setBundle(live))
      .catch(() => setBundle((current) => ({ ...current, message: '目前無法連線正式來源，使用已驗證本機快照' })))
      .finally(() => {
        window.clearTimeout(timeout);
        setLastAttempt(new Date().toISOString());
        setSyncing(false);
      });
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, []);

  return { bundle, syncing, lastAttempt };
}

