import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';

const args = process.argv.slice(2);
const readArg = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const inputPath = readArg('--input');
const projectId = readArg('--project');
const apply = args.includes('--apply');
const allowOverwrite = args.includes('--allow-overwrite');
if (!inputPath || !projectId) throw new Error('Usage: node scripts/import-firestore.mjs --input <json> --project <id> [--apply]');
if (allowOverwrite) throw new Error('Overwriting Firestore documents is disabled; create an adjustment document instead.');

const payload = JSON.parse(await readFile(inputPath, 'utf8'));
if (!Array.isArray(payload.documents)) throw new Error('Input must contain a documents array.');
const paths = new Set();
const marketHistoryPath = /^market_history\/(\d{4}-\d{2}-\d{2})__([a-z0-9_]+)$/;
const validFrequency = new Set(['daily', 'weekly', 'monthly']);
const canonical = (value) => {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => [key, canonical(entry)]));
  return value;
};
for (const row of payload.documents) {
  if (!row || typeof row.path !== 'string' || !row.data || typeof row.data !== 'object' || Array.isArray(row.data)) throw new Error('Each document needs path and object data.');
  if (row.path.split('/').length % 2 !== 0) throw new Error(`Document path must have an even segment count: ${row.path}`);
  if (paths.has(row.path)) throw new Error(`Duplicate document path: ${row.path}`);
  paths.add(row.path);
  if (row.path.startsWith('market_history/')) {
    const match = marketHistoryPath.exec(row.path);
    if (!match) throw new Error(`Invalid market_history document path: ${row.path}`);
    const [sourceDate, pathItem] = match.slice(1);
    const data = row.data;
    if (data.sourceDate !== sourceDate || data.item !== pathItem || data.id !== `${sourceDate}:${pathItem}`) throw new Error(`market_history identity mismatch: ${row.path}`);
    if (typeof data.label !== 'string' || !validFrequency.has(data.frequency) || data.unit !== 'TWD_PER_600G') throw new Error(`market_history value metadata is invalid: ${row.path}`);
    if (data.value !== null && (typeof data.value !== 'number' || !Number.isFinite(data.value) || data.value < 0 || data.value > 500)) throw new Error(`market_history price is invalid: ${row.path}`);
    for (const field of ['sourceName', 'sourceUrl', 'fetchedAt', 'capturedAt', 'rawSnapshotHash', 'parserVersion']) if (typeof data[field] !== 'string' || data[field].length === 0) throw new Error(`market_history provenance is incomplete: ${row.path}`);
  }
}

const summary = payload.documents.reduce((result, row) => {
  const collection = row.path.split('/')[0];
  result[collection] = (result[collection] ?? 0) + 1;
  return result;
}, {});
console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', projectId, documents: payload.documents.length, collections: summary }, null, 2));
if (!apply) {
  console.log('Dry-run only: no Firestore writes were performed.');
} else {
  const app = initializeApp({ credential: applicationDefault(), projectId });
  const firestore = getFirestore(app);
  let created = 0;
  let skipped = 0;
  for (let offset = 0; offset < payload.documents.length; offset += 400) {
    const chunk = payload.documents.slice(offset, offset + 400);
    const references = chunk.map((row) => firestore.doc(row.path));
    const snapshots = await firestore.getAll(...references);
    const batch = firestore.batch();
    let batchCreates = 0;
    snapshots.forEach((snapshot, index) => {
      const row = chunk[index];
      if (!row) return;
      if (snapshot.exists) {
        skipped += 1;
        if (!isDeepStrictEqual(canonical(snapshot.data()), canonical(row.data))) throw new Error(`Refusing to overwrite a different existing document: ${row.path}`);
        return;
      }
      batch.create(references[index], row.data);
      created += 1;
      batchCreates += 1;
    });
    if (batchCreates) await batch.commit();
  }

  const verified = {};
  for (const [collection, expected] of Object.entries(summary)) {
    const snapshot = await firestore.collection(collection).get();
    verified[collection] = { expectedAtLeast: expected, actual: snapshot.size, ok: snapshot.size >= expected };
  }
  console.log(JSON.stringify({ projectId, created, skipped, verified }, null, 2));
}
