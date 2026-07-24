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

export type AssociationBulletinMarketItem =
  | 'black_north_free_male'
  | 'black_north_free_female'
  | 'black_north_caged_male'
  | 'black_north_caged_female'
  | 'black_central_free_male'
  | 'black_central_free_female'
  | 'black_central_caged_male'
  | 'black_central_caged_female'
  | 'black_south_free_male'
  | 'black_south_free_female'
  | 'black_east_free_male'
  | 'black_east_free_female'
  | 'golden_north_male'
  | 'golden_north_female'
  | 'golden_central_male'
  | 'golden_central_female'
  | 'heritage_north_male'
  | 'heritage_north_female'
  | 'heritage_central_male'
  | 'heritage_central_female'
  | 'heritage_south_male'
  | 'heritage_south_female'
  | 'silkie_central'
  | 'silkie_south'
  | 'fighting_north_free_female'
  | 'fighting_north_caged_female'
  | 'fighting_central_free_female'
  | 'fighting_central_caged_female'
  | 'fighting_east_free_female'
  | 'guinea_north_female'
  | 'guinea_central_female'
  | 'wenchang_north'
  | 'zhubei_imitation_hen_all'
  | 'zhubei_imitation_capon_all'
  | 'fighting_capon_all'
  | 'heritage_capon_all';

export type NationalMonthlyMarketItem =
  | 'national_red_monthly'
  | 'national_black_male_monthly'
  | 'national_black_female_monthly';

export type HistoricalMarketItem = Exclude<MarketItem,
  'chick_layer' | 'chick_broiler' | 'chick_red_feather' | 'chick_black_feather'> | AssociationBulletinMarketItem | NationalMonthlyMarketItem;

export interface MarketHistoryResult {
  item: HistoricalMarketItem;
  label: string;
  points: HistoryPoint[];
  unit: 'TWD_PER_600G';
  frequency: MarketFrequency;
  sourceName: string;
  sourceUrl: string;
  fetchedAt: string;
  snapshot: RawSnapshot;
}
