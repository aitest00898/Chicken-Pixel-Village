export type MarketFrequency = 'daily' | 'weekly' | 'monthly';
export type MarketStatus = 'verified-live' | 'verified-cache' | 'verified-fixture' | 'stale' | 'missing' | 'closed';
export type MarketItem =
  | 'egg_producer'
  | 'egg_transport'
  | 'broiler_large'
  | 'broiler_medium'
  | 'broiler_store_kp'
  | 'red_north_male'
  | 'red_north_female'
  | 'red_central_male'
  | 'red_central_female'
  | 'red_south_male'
  | 'red_south_female'
  | 'black_south_male'
  | 'black_south_female'
  | 'chick_layer'
  | 'chick_broiler'
  | 'chick_red_feather'
  | 'chick_black_feather';

export interface MarketRecord {
  id: string;
  item: MarketItem;
  label: string;
  value: number | null;
  unit: 'TWD_PER_600G' | 'TWD_PER_CHICK';
  frequency: MarketFrequency;
  sourceDate: string;
  sourcePublishedAt: string | null;
  fetchedAt: string;
  sourceName: string;
  sourceUrl: string;
  status: MarketStatus;
  rawSnapshotHash: string;
  parserVersion: string;
  validationStatus: 'valid' | 'warning' | 'invalid';
}

export interface RawSnapshot {
  sourceUrl: string;
  fetchedAt: string;
  payload: unknown;
  sha256: string;
  parserVersion: string;
}

export interface MarketBundle {
  records: MarketRecord[];
  snapshots: RawSnapshot[];
  mode: 'live' | 'fixture';
  message: string;
}

export interface HistoryPoint {
  date: string;
  value: number | null;
}

export type HistoricalMarketItem = Exclude<MarketItem,
  'chick_layer' | 'chick_broiler' | 'chick_red_feather' | 'chick_black_feather'>;

export interface MarketHistoryResult {
  item: HistoricalMarketItem;
  label: string;
  points: HistoryPoint[];
  unit: 'TWD_PER_600G';
  frequency: 'daily';
  sourceName: string;
  sourceUrl: string;
  fetchedAt: string;
  snapshot: RawSnapshot;
}
