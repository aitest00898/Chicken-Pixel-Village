import type { HistoricalMarketItem, HistoryPoint, MarketBundle, MarketHistoryResult, MarketItem, MarketRecord, RawSnapshot } from './types';

const BASE = 'https://data.moa.gov.tw/api/v1';
export const MOA_PARSER_VERSION = 'moa-poultry-v1.0.0';

interface MoaResponse<T> { RS?: string; Data?: T[]; Next?: boolean }
interface RedRow {
  TransDate?: string; RedFeather_N_M?: string; RedFeather_N_F?: string; RedFeather_C_M?: string; RedFeather_C_F?: string; RedFeather_S_M?: string; RedFeather_S_F?: string;
}
interface BlackRow { TransDate?: string; BlackFeather_S_M?: string; BlackFeather_S_F?: string }
interface BroilerRow {
  TransDate?: string; 'TaijinPrice_2.0kgup'?: string; 'TaijinPrice_1.75kg_1.95kg'?: string; Store_KP_TaijinPrice?: string; egg_Price?: string; egg_Producer_Price?: string;
}

type PoultryRow = RedRow & BlackRow & BroilerRow;

export interface HistorySeriesDefinition {
  item: HistoricalMarketItem;
  label: string;
  group: string;
  endpoint: string;
  read: (row: PoultryRow) => string | undefined;
}

export const historyMarketOptions: readonly HistorySeriesDefinition[] = [
  { item: 'red_north_male', label: '紅羽土雞・公・北區', group: '紅羽土雞', endpoint: 'PoultryTransType_RedFeather', read: (row) => row.RedFeather_N_M },
  { item: 'red_north_female', label: '紅羽土雞・母・北區', group: '紅羽土雞', endpoint: 'PoultryTransType_RedFeather', read: (row) => row.RedFeather_N_F },
  { item: 'red_central_male', label: '紅羽土雞・公・中區', group: '紅羽土雞', endpoint: 'PoultryTransType_RedFeather', read: (row) => row.RedFeather_C_M },
  { item: 'red_central_female', label: '紅羽土雞・母・中區', group: '紅羽土雞', endpoint: 'PoultryTransType_RedFeather', read: (row) => row.RedFeather_C_F },
  { item: 'red_south_male', label: '紅羽土雞・公・南區', group: '紅羽土雞', endpoint: 'PoultryTransType_RedFeather', read: (row) => row.RedFeather_S_M },
  { item: 'red_south_female', label: '紅羽土雞・母・南區', group: '紅羽土雞', endpoint: 'PoultryTransType_RedFeather', read: (row) => row.RedFeather_S_F },
  { item: 'black_south_male', label: '黑羽土雞・公・南區舍飼', group: '黑羽土雞', endpoint: 'PoultryTransType_BlackFeather', read: (row) => row.BlackFeather_S_M },
  { item: 'black_south_female', label: '黑羽土雞・母・南區舍飼', group: '黑羽土雞', endpoint: 'PoultryTransType_BlackFeather', read: (row) => row.BlackFeather_S_F },
  { item: 'broiler_large', label: '白肉雞・2.0 kg 以上', group: '白肉雞', endpoint: 'PoultryTransType_BoiledChicken_Eggs', read: (row) => row['TaijinPrice_2.0kgup'] },
  { item: 'broiler_medium', label: '白肉雞・1.75–1.95 kg', group: '白肉雞', endpoint: 'PoultryTransType_BoiledChicken_Eggs', read: (row) => row['TaijinPrice_1.75kg_1.95kg'] },
  { item: 'broiler_store_kp', label: '白肉雞・高屏門市', group: '白肉雞', endpoint: 'PoultryTransType_BoiledChicken_Eggs', read: (row) => row.Store_KP_TaijinPrice },
  { item: 'egg_producer', label: '雞蛋・產地', group: '雞蛋', endpoint: 'PoultryTransType_BoiledChicken_Eggs', read: (row) => row.egg_Producer_Price },
  { item: 'egg_transport', label: '雞蛋・大運輸', group: '雞蛋', endpoint: 'PoultryTransType_BoiledChicken_Eggs', read: (row) => row.egg_Price },
] as const;

function apiDate(value: Date): string {
  return `${value.getFullYear()}/${String(value.getMonth() + 1).padStart(2, '0')}/${String(value.getDate()).padStart(2, '0')}`;
}

function isoDate(value: string | undefined): string {
  if (!value || !/^\d{4}\/\d{2}\/\d{2}$/.test(value)) throw new Error('MOA row has an invalid date');
  return value.replaceAll('/', '-');
}

function numberOrNull(value: string | undefined): number | null {
  if (value === undefined || value.trim() === '' || value.includes('休市')) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 500) throw new Error(`Invalid poultry price: ${value}`);
  return parsed;
}

async function sha256(payload: string): Promise<string> {
  const bytes = new TextEncoder().encode(payload);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function fetchSnapshot<T>(endpoint: string, start: string, end: string, fetchedAt: string, signal?: AbortSignal): Promise<{ row: T; snapshot: RawSnapshot }> {
  const query = new URLSearchParams({ Start_time: start, End_time: end });
  const sourceUrl = `${BASE}/${endpoint}/?${query.toString()}`;
  const request: RequestInit = { headers: { Accept: 'application/json' } };
  if (signal !== undefined) request.signal = signal;
  const response = await fetch(sourceUrl, request);
  if (!response.ok) throw new Error(`MOA ${endpoint} returned ${response.status}`);
  const text = await response.text();
  const payload = JSON.parse(text.replace(/^\uFEFF/, '')) as MoaResponse<T>;
  if (payload.RS !== 'OK' || !Array.isArray(payload.Data) || payload.Data.length === 0) throw new Error(`MOA ${endpoint} returned no usable rows`);
  const row = payload.Data[0];
  if (row === undefined) throw new Error(`MOA ${endpoint} returned an empty first row`);
  return {
    row,
    snapshot: { sourceUrl, fetchedAt, payload, sha256: await sha256(text), parserVersion: MOA_PARSER_VERSION },
  };
}

export function parseMoaHistoryRows(item: HistoricalMarketItem, rows: PoultryRow[]): HistoryPoint[] {
  const definition = historyMarketOptions.find((option) => option.item === item);
  if (!definition) throw new Error(`Unsupported poultry history item: ${item}`);
  const byDate = new Map<string, HistoryPoint>();
  for (const row of rows) {
    const date = isoDate(row.TransDate);
    byDate.set(date, { date, value: numberOrNull(definition.read(row)) });
  }
  return [...byDate.values()].sort((left, right) => left.date.localeCompare(right.date));
}

export async function fetchMoaPoultryHistory(
  item: HistoricalMarketItem,
  startDate: Date,
  endDate: Date,
  signal?: AbortSignal,
): Promise<MarketHistoryResult> {
  const definition = historyMarketOptions.find((option) => option.item === item);
  if (!definition) throw new Error(`Unsupported poultry history item: ${item}`);
  const range = endDate.getTime() - startDate.getTime();
  if (!Number.isFinite(range) || range < 0 || range > 366 * 86_400_000) throw new Error('MOA history range must be between 0 and 366 days');
  const fetchedAt = new Date().toISOString();
  const query = new URLSearchParams({ Start_time: apiDate(startDate), End_time: apiDate(endDate) });
  const sourceUrl = `${BASE}/${definition.endpoint}/?${query.toString()}`;
  const request: RequestInit = { headers: { Accept: 'application/json' } };
  if (signal !== undefined) request.signal = signal;
  const response = await fetch(sourceUrl, request);
  if (!response.ok) throw new Error(`MOA ${definition.endpoint} returned ${response.status}`);
  const text = await response.text();
  const payload = JSON.parse(text.replace(/^\uFEFF/, '')) as MoaResponse<PoultryRow>;
  if (payload.RS !== 'OK' || !Array.isArray(payload.Data)) throw new Error(`MOA ${definition.endpoint} returned an invalid payload`);
  const snapshot: RawSnapshot = {
    sourceUrl,
    fetchedAt,
    payload,
    sha256: await sha256(text),
    parserVersion: MOA_PARSER_VERSION,
  };
  return {
    item,
    label: definition.label,
    points: parseMoaHistoryRows(item, payload.Data),
    unit: 'TWD_PER_600G',
    frequency: 'daily',
    sourceName: '農業部 Open Data',
    sourceUrl,
    fetchedAt,
    snapshot,
  };
}

interface FieldMap<T> { item: MarketItem; label: string; read: (row: T) => string | undefined }

function normalize<T extends { TransDate?: string }>(row: T, snapshot: RawSnapshot, fields: FieldMap<T>[]): MarketRecord[] {
  const sourceDate = isoDate(row.TransDate);
  return fields.map((field) => ({
    id: `${sourceDate}:${field.item}`,
    item: field.item,
    label: field.label,
    value: numberOrNull(field.read(row)),
    unit: 'TWD_PER_600G',
    frequency: 'daily',
    sourceDate,
    sourcePublishedAt: null,
    fetchedAt: snapshot.fetchedAt,
    sourceName: '農業部 Open Data',
    sourceUrl: snapshot.sourceUrl,
    status: 'verified-live',
    rawSnapshotHash: snapshot.sha256,
    parserVersion: snapshot.parserVersion,
    validationStatus: 'valid',
  }));
}

export async function fetchLatestMoaPoultry(now = new Date(), signal?: AbortSignal): Promise<MarketBundle> {
  const end = apiDate(now);
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 10);
  const start = apiDate(startDate);
  const fetchedAt = now.toISOString();
  const [red, black, broiler] = await Promise.all([
    fetchSnapshot<RedRow>('PoultryTransType_RedFeather', start, end, fetchedAt, signal),
    fetchSnapshot<BlackRow>('PoultryTransType_BlackFeather', start, end, fetchedAt, signal),
    fetchSnapshot<BroilerRow>('PoultryTransType_BoiledChicken_Eggs', start, end, fetchedAt, signal),
  ]);
  const records = [
    ...normalize(red.row, red.snapshot, [
      { item: 'red_north_male', label: '紅羽土雞・公・北區', read: (row) => row.RedFeather_N_M },
      { item: 'red_north_female', label: '紅羽土雞・母・北區', read: (row) => row.RedFeather_N_F },
      { item: 'red_central_male', label: '紅羽土雞・公・中區', read: (row) => row.RedFeather_C_M },
      { item: 'red_central_female', label: '紅羽土雞・母・中區', read: (row) => row.RedFeather_C_F },
      { item: 'red_south_male', label: '紅羽土雞・公・南區', read: (row) => row.RedFeather_S_M },
      { item: 'red_south_female', label: '紅羽土雞・母・南區', read: (row) => row.RedFeather_S_F },
    ]),
    ...normalize(black.row, black.snapshot, [
      { item: 'black_south_male', label: '黑羽土雞・公・舍飼', read: (row) => row.BlackFeather_S_M },
      { item: 'black_south_female', label: '黑羽土雞・母・舍飼', read: (row) => row.BlackFeather_S_F },
    ]),
    ...normalize(broiler.row, broiler.snapshot, [
      { item: 'broiler_large', label: '白肉雞・2.0 kg 以上', read: (row) => row['TaijinPrice_2.0kgup'] },
      { item: 'broiler_medium', label: '白肉雞・1.75–1.95 kg', read: (row) => row['TaijinPrice_1.75kg_1.95kg'] },
      { item: 'broiler_store_kp', label: '白肉雞・高屏門市', read: (row) => row.Store_KP_TaijinPrice },
      { item: 'egg_transport', label: '雞蛋・大運輸', read: (row) => row.egg_Price },
      { item: 'egg_producer', label: '雞蛋・產地', read: (row) => row.egg_Producer_Price },
    ]),
  ];
  return { records, snapshots: [red.snapshot, black.snapshot, broiler.snapshot], mode: 'live', message: '已連線農業部 Open Data' };
}
