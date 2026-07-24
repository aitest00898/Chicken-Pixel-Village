import { demoHouses, initialVisitProgress, recordVisit, type ChickenHouse, type VisitProgress } from '@chicken-village/domain';
import { Capacitor } from '@capacitor/core';
import { get, set } from 'idb-keyval';
import { useCallback, useEffect, useState } from 'react';

const HOUSES_KEY = 'cpv:cache:houses:v1';
const VISIT_KEY = 'cpv:draft:visit:v1';

interface VillagePersistence {
  loadHouses(): Promise<ChickenHouse[]>;
  saveHouses(houses: ChickenHouse[]): Promise<void>;
  loadVisitProgress(): Promise<VisitProgress | null>;
  saveVisitProgress(progress: VisitProgress): Promise<void>;
  close(): Promise<void>;
}

const webPersistence: VillagePersistence = {
  async loadHouses() { return (await get<ChickenHouse[]>(HOUSES_KEY)) ?? []; },
  async saveHouses(houses) { await set(HOUSES_KEY, houses); },
  async loadVisitProgress() { return (await get<VisitProgress>(VISIT_KEY)) ?? null; },
  async saveVisitProgress(progress) { await set(VISIT_KEY, progress); },
  async close() { /* IndexedDB lifecycle is browser-managed. */ },
};

export function useVillageState() {
  const [houses, setHouses] = useState<ChickenHouse[]>(demoHouses);
  const [visits, setVisits] = useState<VisitProgress>(initialVisitProgress);
  const [ready, setReady] = useState(false);
  const [storageMode, setStorageMode] = useState<'native-sqlite' | 'web-cache'>('web-cache');
  const [persistence, setPersistence] = useState<VillagePersistence>(webPersistence);

  useEffect(() => {
    let active = true;
    let selected: VillagePersistence = webPersistence;
    void (async () => {
      if (Capacitor.isNativePlatform()) {
        const { NativeVillageDatabase } = await import('../storage/nativeSqlite');
        const native = new NativeVillageDatabase();
        await native.initialize();
        selected = native;
      }
      const [storedHouses, storedVisits] = await Promise.all([selected.loadHouses(), selected.loadVisitProgress()]);
      if (!active) return;
      setPersistence(selected);
      setStorageMode(Capacitor.isNativePlatform() ? 'native-sqlite' : 'web-cache');
      if (storedHouses.length) setHouses(storedHouses);
      else await selected.saveHouses(demoHouses);
      if (storedVisits) setVisits(storedVisits);
      else await selected.saveVisitProgress(initialVisitProgress);
    })()
      .catch(() => {
        // Defaults remain usable if local storage is temporarily unavailable.
      })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; void selected.close(); };
  }, []);

  const addHouse = useCallback((house: ChickenHouse) => {
    setHouses((current) => {
      const next = [...current, house];
      void persistence.saveHouses(next);
      return next;
    });
  }, [persistence]);

  const visitToday = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    setVisits((current) => {
      const next = recordVisit(current, today);
      void persistence.saveVisitProgress(next);
      return next;
    });
  }, [persistence]);

  const equip = useCallback((slot: 'head' | 'body' | 'hand' | 'back', itemId: string) => {
    setVisits((current) => {
      const next = { ...current, equipped: { ...current.equipped, [slot]: itemId } };
      void persistence.saveVisitProgress(next);
      return next;
    });
  }, [persistence]);

  return { houses, visits, ready, storageMode, addHouse, visitToday, equip };
}
