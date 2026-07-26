import {
  ASSOCIATION_BULLETIN_PARSER_VERSION,
  ASSOCIATION_BULLETIN_SOURCE,
  ASSOCIATION_BULLETIN_URL,
  CENTRAL_LIVESTOCK_MONTHLY_ENDPOINT,
  CENTRAL_LIVESTOCK_MONTHLY_PARSER_VERSION,
  CENTRAL_LIVESTOCK_MONTHLY_SOURCE,
  CENTRAL_LIVESTOCK_MONTHLY_URL,
  fetchMoaPoultryHistories,
  historyMarketOptions,
  type HistoricalMarketItem,
  type HistoryPoint,
  type MarketHistoryResult,
  type MarketRecord,
  type RawSnapshot,
} from '@chicken-village/market-data';
import { collection, doc, getDoc, getDocs, query, where, writeBatch } from 'firebase/firestore/lite';
import { signInAnonymously } from 'firebase/auth';
import { firebaseArchiveAuth, firebaseArchiveFirestoreLite, firebaseFirestoreLite } from './firebase';

interface StoredHistoryRecord {
  item: HistoricalMarketItem;
  label: string;
  value: number | null;
  sourceDate: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  sourceName: string;
  sourceUrl: string;
  fetchedAt: string;
  rawSnapshotHash: string;
  parserVersion: string;
}

function parseStoredRecord(value: Record<string, unknown>): StoredHistoryRecord | null {
  if (typeof value.item !== 'string' || typeof value.label !== 'string' || typeof value.sourceDate !== 'string') return null;
  if (value.value !== null && typeof value.value !== 'number') return null;
  if (!['daily', 'weekly', 'monthly'].includes(String(value.frequency))) return null;
  return {
    item: value.item as HistoricalMarketItem,
    label: value.label,
    value: value.value as number | null,
    sourceDate: value.sourceDate,
    frequency: value.frequency as StoredHistoryRecord['frequency'],
    sourceName: typeof value.sourceName === 'string' ? value.sourceName : 'Firebase 歷史行情',
    sourceUrl: typeof value.sourceUrl === 'string' ? value.sourceUrl : ASSOCIATION_BULLETIN_URL,
    fetchedAt: typeof value.fetchedAt === 'string' ? value.fetchedAt : new Date(0).toISOString(),
    rawSnapshotHash: typeof value.rawSnapshotHash === 'string' ? value.rawSnapshotHash : 'missing-hash',
    parserVersion: typeof value.parserVersion === 'string' ? value.parserVersion : 'unknown',
  };
}

function isoDate(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

async function loadStoredRecords(startDate: Date, endDate: Date): Promise<StoredHistoryRecord[]> {
  if (!firebaseFirestoreLite) return [];
  const snapshot = await getDocs(query(
    collection(firebaseFirestoreLite, 'market_history'),
    where('sourceDate', '>=', isoDate(startDate)),
    where('sourceDate', '<=', isoDate(endDate)),
  ));
  return snapshot.docs.map((row) => parseStoredRecord(row.data())).filter((row): row is StoredHistoryRecord => row !== null);
}

function storedMetadata(item: HistoricalMarketItem) {
  const endpoint = historyMarketOptions.find((option) => option.item === item)?.endpoint;
  if (endpoint === CENTRAL_LIVESTOCK_MONTHLY_ENDPOINT) return {
    sourceName: CENTRAL_LIVESTOCK_MONTHLY_SOURCE,
    sourceUrl: CENTRAL_LIVESTOCK_MONTHLY_URL,
    parserVersion: CENTRAL_LIVESTOCK_MONTHLY_PARSER_VERSION,
    frequency: 'monthly' as const,
  };
  return {
    sourceName: ASSOCIATION_BULLETIN_SOURCE,
    sourceUrl: ASSOCIATION_BULLETIN_URL,
    parserVersion: ASSOCIATION_BULLETIN_PARSER_VERSION,
    frequency: 'daily' as const,
  };
}

export async function loadFirebaseMarketHistories(
  items: readonly HistoricalMarketItem[],
  startDate: Date,
  endDate: Date,
  signal?: AbortSignal,
): Promise<MarketHistoryResult[]> {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  const [stored, remote] = await Promise.all([
    loadStoredRecords(startDate, endDate),
    fetchMoaPoultryHistories(items, startDate, endDate, signal).catch(() => []),
  ]);
  return items.map((item) => {
    const definition = historyMarketOptions.find((option) => option.item === item);
    if (!definition) throw new Error(`Unsupported poultry history item: ${item}`);
    const remoteResult = remote.find((result) => result.item === item);
    const storedRows = stored.filter((row) => row.item === item);
    const points = new Map<string, HistoryPoint>();
    remoteResult?.points.forEach((point) => points.set(point.date, point));
    storedRows.forEach((row) => points.set(row.sourceDate, { date: row.sourceDate, value: row.value }));
    const metadata = storedRows[0] ?? storedMetadata(item);
    const snapshot: RawSnapshot = remoteResult?.snapshot ?? {
      sourceUrl: metadata.sourceUrl,
      fetchedAt: 'fetchedAt' in metadata ? metadata.fetchedAt : new Date().toISOString(),
      payload: { firestoreDocuments: storedRows.length },
      sha256: 'rawSnapshotHash' in metadata ? metadata.rawSnapshotHash : `firestore-${item}-${storedRows.length}`,
      parserVersion: metadata.parserVersion,
    };
    return {
      item,
      label: definition.label,
      points: [...points.values()].sort((left, right) => left.date.localeCompare(right.date)),
      unit: 'TWD_PER_600G',
      frequency: storedRows[0]?.frequency ?? remoteResult?.frequency ?? metadata.frequency,
      sourceName: storedRows[0]?.sourceName ?? remoteResult?.sourceName ?? metadata.sourceName,
      sourceUrl: storedRows[0]?.sourceUrl ?? remoteResult?.sourceUrl ?? metadata.sourceUrl,
      fetchedAt: storedRows[0]?.fetchedAt ?? remoteResult?.fetchedAt ?? new Date().toISOString(),
      snapshot,
    };
  });
}

export async function persistDailyMarketRecords(records: readonly MarketRecord[]) {
  const archiveAuth = firebaseArchiveAuth;
  const archiveFirestore = firebaseArchiveFirestoreLite;
  if (!archiveAuth || !archiveFirestore || !records.length) return { inserted: 0, skipped: 0 };
  if (!archiveAuth.currentUser) await signInAnonymously(archiveAuth);
  const uniqueRecords = [...new Map(records.map((record) => [
    `${record.sourceDate}__${record.item}`.replaceAll('/', '-'),
    record,
  ])).entries()];
  const existing = await Promise.all(uniqueRecords.map(async ([id]) => (
    await getDoc(doc(archiveFirestore, 'market_history', id))
  ).exists()));
  const batch = writeBatch(archiveFirestore);
  let inserted = 0;
  uniqueRecords.forEach(([id, record], index) => {
    if (existing[index]) return;
    batch.set(doc(archiveFirestore, 'market_history', id), { ...record, capturedAt: new Date().toISOString() });
    inserted += 1;
  });
  if (inserted) await batch.commit();
  return { inserted, skipped: uniqueRecords.length - inserted };
}

export async function loadPreviousMarketRecords(records: readonly MarketRecord[]): Promise<MarketRecord[]> {
  if (!records.length) return [];
  const validDates = records.map((record) => record.sourceDate).filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)).sort();
  const earliest = validDates[0];
  const latest = validDates.at(-1);
  if (!earliest || !latest) return [];
  const startDate = new Date(`${earliest}T12:00:00`);
  startDate.setDate(startDate.getDate() - 120);
  const stored = await loadStoredRecords(startDate, new Date(`${latest}T12:00:00`));
  return records.flatMap((current) => {
    const previous = stored
      .filter((row) => row.item === current.item && row.value !== null && row.sourceDate < current.sourceDate)
      .sort((left, right) => left.sourceDate.localeCompare(right.sourceDate))
      .at(-1);
    if (!previous) return [];
    return [{
      ...current,
      id: `${previous.sourceDate}:${current.item}`,
      value: previous.value,
      sourceDate: previous.sourceDate,
      sourcePublishedAt: null,
      fetchedAt: previous.fetchedAt,
      sourceName: previous.sourceName,
      sourceUrl: previous.sourceUrl,
      status: 'verified-cache' as const,
      rawSnapshotHash: previous.rawSnapshotHash,
      parserVersion: previous.parserVersion,
      validationStatus: 'valid' as const,
    }];
  });
}
