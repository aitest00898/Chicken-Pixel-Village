import { createHash } from 'node:crypto';
import { getFirestore } from 'firebase-admin/firestore';

const BASE_URL = 'https://data.moa.gov.tw/api/v1';
const PARSER_VERSION = 'moa-poultry-scheduled-v1.0.0';

interface MoaPayload { RS?: string; Data?: Array<Record<string, string | undefined>> }
interface FieldDefinition { item: string; label: string; field: string }
interface EndpointDefinition { endpoint: string; fields: FieldDefinition[] }

const endpoints: EndpointDefinition[] = [
  {
    endpoint: 'PoultryTransType_RedFeather',
    fields: [
      { item: 'red_north_male', label: '紅羽土雞・公・北區', field: 'RedFeather_N_M' },
      { item: 'red_north_female', label: '紅羽土雞・母・北區', field: 'RedFeather_N_F' },
      { item: 'red_central_male', label: '紅羽土雞・公・中區', field: 'RedFeather_C_M' },
      { item: 'red_central_female', label: '紅羽土雞・母・中區', field: 'RedFeather_C_F' },
      { item: 'red_south_male', label: '紅羽土雞・公・南區', field: 'RedFeather_S_M' },
      { item: 'red_south_female', label: '紅羽土雞・母・南區', field: 'RedFeather_S_F' },
    ],
  },
  {
    endpoint: 'PoultryTransType_BlackFeather',
    fields: [
      { item: 'black_south_male', label: '黑羽土雞・公・南區舍飼', field: 'BlackFeather_S_M' },
      { item: 'black_south_female', label: '黑羽土雞・母・南區舍飼', field: 'BlackFeather_S_F' },
    ],
  },
  {
    endpoint: 'PoultryTransType_BoiledChicken_Eggs',
    fields: [
      { item: 'broiler_large', label: '白肉雞・2.0 kg 以上', field: 'TaijinPrice_2.0kgup' },
      { item: 'broiler_medium', label: '白肉雞・1.75–1.95 kg', field: 'TaijinPrice_1.75kg_1.95kg' },
      { item: 'broiler_store_kp', label: '白肉雞・高屏門市', field: 'Store_KP_TaijinPrice' },
      { item: 'egg_transport', label: '雞蛋・大運輸', field: 'egg_Price' },
      { item: 'egg_producer', label: '雞蛋・產地', field: 'egg_Producer_Price' },
    ],
  },
];

export interface ScheduledMarketRecord {
  item: string;
  label: string;
  value: number | null;
  unit: 'TWD_PER_600G';
  frequency: 'daily';
  sourceDate: string;
  sourcePublishedAt: null;
  fetchedAt: string;
  sourceName: '農業部 Open Data';
  sourceUrl: string;
  status: 'verified-live' | 'missing';
  rawSnapshotHash: string;
  parserVersion: string;
  validationStatus: 'valid';
  capturedBy: 'scheduled-function';
}

function taipeiDate(value: Date, separator: '/' | '-'): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(value);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';
  return [read('year'), read('month'), read('day')].join(separator);
}

function sourceDate(value: string | undefined): string {
  if (!value || !/^\d{4}\/\d{2}\/\d{2}$/.test(value)) throw new Error('MOA row has an invalid date');
  return value.replaceAll('/', '-');
}

function price(value: string | undefined): number | null {
  if (value === undefined || value.trim() === '' || value.includes('休市')) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 500) throw new Error(`Invalid poultry price: ${value}`);
  return parsed;
}

function newestRow(rows: Array<Record<string, string | undefined>>) {
  return [...rows].sort((left, right) => String(right.TransDate ?? '').localeCompare(String(left.TransDate ?? '')))[0];
}

export async function fetchScheduledMarketRecords(
  now = new Date(),
  fetcher: typeof fetch = fetch,
): Promise<ScheduledMarketRecord[]> {
  const end = taipeiDate(now, '/');
  const start = taipeiDate(new Date(now.getTime() - 10 * 86_400_000), '/');
  const fetchedAt = now.toISOString();
  const groups = await Promise.all(endpoints.map(async (definition) => {
    const query = new URLSearchParams({ Start_time: start, End_time: end });
    const url = `${BASE_URL}/${definition.endpoint}/?${query}`;
    const response = await fetcher(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`MOA ${definition.endpoint} returned ${response.status}`);
    const text = await response.text();
    const payload = JSON.parse(text.replace(/^\uFEFF/, '')) as MoaPayload;
    if (payload.RS !== 'OK' || !Array.isArray(payload.Data) || payload.Data.length === 0) {
      throw new Error(`MOA ${definition.endpoint} returned no usable rows`);
    }
    const row = newestRow(payload.Data);
    if (!row) throw new Error(`MOA ${definition.endpoint} returned no row`);
    const date = sourceDate(row.TransDate);
    const hash = createHash('sha256').update(text).digest('hex');
    return definition.fields.map((field): ScheduledMarketRecord => {
      const value = price(row[field.field]);
      return {
        item: field.item,
        label: field.label,
        value,
        unit: 'TWD_PER_600G',
        frequency: 'daily',
        sourceDate: date,
        sourcePublishedAt: null,
        fetchedAt,
        sourceName: '農業部 Open Data',
        sourceUrl: url,
        status: value === null ? 'missing' : 'verified-live',
        rawSnapshotHash: hash,
        parserVersion: PARSER_VERSION,
        validationStatus: 'valid',
        capturedBy: 'scheduled-function',
      };
    });
  }));
  return groups.flat();
}

export async function archiveOfficialMarketRecords(now = new Date()) {
  const records = await fetchScheduledMarketRecords(now);
  const firestore = getFirestore();
  const batch = firestore.batch();
  records.forEach((record) => {
    const id = `${record.sourceDate}__${record.item}`;
    batch.set(firestore.doc(`market_history/${id}`), { ...record, capturedAt: now.toISOString() }, { merge: true });
  });
  const sourceDates = [...new Set(records.map((record) => record.sourceDate))].sort();
  batch.set(firestore.doc('system_jobs/daily_market_archive'), {
    lastRunAt: now.toISOString(),
    lastSuccessfulRunAt: now.toISOString(),
    sourceDates,
    latestSourceDate: sourceDates.at(-1) ?? null,
    recordCount: records.length,
    status: 'success',
  }, { merge: true });
  await batch.commit();
  return { recordCount: records.length, sourceDates };
}

export async function recordMarketArchiveFailure(error: unknown, now = new Date()) {
  await getFirestore().doc('system_jobs/daily_market_archive').set({
    lastRunAt: now.toISOString(),
    lastFailureAt: now.toISOString(),
    status: 'failure',
    error: error instanceof Error ? error.message.slice(0, 500) : 'Unknown archive failure',
  }, { merge: true });
}

