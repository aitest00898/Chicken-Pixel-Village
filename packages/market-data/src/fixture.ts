import type { MarketRecord } from './types';

const fetchedAt = '2026-07-24T04:30:00.000Z';
const sourceDate = '2026-07-23';
const base = {
  unit: 'TWD_PER_600G' as const,
  frequency: 'daily' as const,
  sourceDate,
  sourcePublishedAt: null,
  fetchedAt,
  sourceName: '農業部 Open Data（已驗證快照）',
  sourceUrl: 'https://data.moa.gov.tw/api/v1',
  status: 'verified-fixture' as const,
  rawSnapshotHash: 'fixture-2026-07-23-verified-against-naif',
  parserVersion: 'moa-poultry-v1.0.0',
  validationStatus: 'valid' as const,
};

export const verifiedMarketFixture: MarketRecord[] = [
  { ...base, id: `${sourceDate}:egg_producer`, item: 'egg_producer', label: '雞蛋・產地', value: 34.5 },
  { ...base, id: `${sourceDate}:egg_transport`, item: 'egg_transport', label: '雞蛋・大運輸', value: 37.5 },
  { ...base, id: `${sourceDate}:broiler_large`, item: 'broiler_large', label: '白肉雞・2.0 kg 以上', value: 33.8 },
  { ...base, id: `${sourceDate}:broiler_medium`, item: 'broiler_medium', label: '白肉雞・1.75–1.95 kg', value: 33.8 },
  { ...base, id: `${sourceDate}:broiler_store_kp`, item: 'broiler_store_kp', label: '白肉雞・高屏門市', value: 35.3 },
  { ...base, id: `${sourceDate}:red_north_male`, item: 'red_north_male', label: '紅羽土雞・公・北區', value: 46 },
  { ...base, id: `${sourceDate}:red_north_female`, item: 'red_north_female', label: '紅羽土雞・母・北區', value: 46 },
  { ...base, id: `${sourceDate}:red_central_male`, item: 'red_central_male', label: '紅羽土雞・公・中區', value: 47 },
  { ...base, id: `${sourceDate}:red_central_female`, item: 'red_central_female', label: '紅羽土雞・母・中區', value: 47 },
  { ...base, id: `${sourceDate}:red_south_male`, item: 'red_south_male', label: '紅羽土雞・公・南區', value: 50 },
  { ...base, id: `${sourceDate}:red_south_female`, item: 'red_south_female', label: '紅羽土雞・母・南區', value: 48 },
  { ...base, id: `${sourceDate}:black_south_male`, item: 'black_south_male', label: '黑羽土雞・公・舍飼', value: 48 },
  { ...base, id: `${sourceDate}:black_south_female`, item: 'black_south_female', label: '黑羽土雞・母・舍飼', value: 48 },
];

export interface HistoryPoint { date: string; value: number | null }

export const redSouthHistory: HistoryPoint[] = [
  ['2026-05-01', 52], ['2026-05-08', 52], ['2026-05-15', 54], ['2026-05-22', 54], ['2026-05-29', 52],
  ['2026-06-05', 52], ['2026-06-12', 52], ['2026-06-19', 52], ['2026-06-26', 52], ['2026-07-03', 50],
  ['2026-07-10', 50], ['2026-07-17', 50], ['2026-07-23', 50],
].map(([date, value]) => ({ date: String(date), value: Number(value) }));

