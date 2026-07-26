import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MarketRecord } from '@chicken-village/market-data';

const { batchCommit, batchSet, getDocMock } = vi.hoisted(() => ({
  batchCommit: vi.fn(),
  batchSet: vi.fn(),
  getDocMock: vi.fn(),
}));

vi.mock('firebase/firestore/lite', () => ({
  collection: vi.fn(),
  doc: (_database: unknown, collection: string, id: string) => `${collection}/${id}`,
  getDoc: getDocMock,
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  writeBatch: () => ({ set: batchSet, commit: batchCommit }),
}));

vi.mock('firebase/auth', () => ({
  signInAnonymously: vi.fn(),
}));

vi.mock('./firebase', () => ({
  firebaseArchiveAuth: { currentUser: { uid: 'archive-user' } },
  firebaseArchiveFirestoreLite: { kind: 'archive' },
  firebaseFirestoreLite: { kind: 'read' },
}));

import { persistDailyMarketRecords } from './marketHistory';

const record = (item: MarketRecord['item']): MarketRecord => ({
  id: `2026-07-24:${item}`,
  item,
  label: item,
  value: 50,
  unit: 'TWD_PER_600G',
  frequency: 'daily',
  sourceDate: '2026-07-24',
  sourcePublishedAt: null,
  fetchedAt: '2026-07-24T10:00:00.000Z',
  sourceName: '農業部 Open Data',
  sourceUrl: 'https://data.moa.gov.tw/',
  status: 'verified-live',
  rawSnapshotHash: 'hash',
  parserVersion: 'test',
  validationStatus: 'valid',
});

describe('persistDailyMarketRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('only creates date-and-item documents that are not already in Firestore', async () => {
    getDocMock
      .mockResolvedValueOnce({ exists: () => true })
      .mockResolvedValueOnce({ exists: () => false });

    const result = await persistDailyMarketRecords([record('red_north_male'), record('red_central_male')]);

    expect(result).toEqual({ inserted: 1, skipped: 1 });
    expect(batchSet).toHaveBeenCalledTimes(1);
    expect(batchSet).toHaveBeenCalledWith(
      'market_history/2026-07-24__red_central_male',
      expect.objectContaining({ item: 'red_central_male', sourceDate: '2026-07-24' }),
    );
    expect(batchCommit).toHaveBeenCalledTimes(1);
  });

  it('does not commit a batch when all requested documents already exist', async () => {
    getDocMock.mockResolvedValue({ exists: () => true });

    const result = await persistDailyMarketRecords([record('red_north_male')]);

    expect(result).toEqual({ inserted: 0, skipped: 1 });
    expect(batchSet).not.toHaveBeenCalled();
    expect(batchCommit).not.toHaveBeenCalled();
  });
});
