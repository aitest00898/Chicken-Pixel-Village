import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'node:fs/promises';

const args = process.argv.slice(2);
const readArg = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const inputPath = readArg('--input');
const projectId = readArg('--project');
const apply = args.includes('--apply');
if (!inputPath || !projectId) throw new Error('Usage: node scripts/import-firestore.mjs --input <json> --project <id> [--apply]');

const payload = JSON.parse(await readFile(inputPath, 'utf8'));
if (!Array.isArray(payload.documents)) throw new Error('Input must contain a documents array.');
const paths = new Set();
for (const row of payload.documents) {
  if (!row || typeof row.path !== 'string' || !row.data || typeof row.data !== 'object' || Array.isArray(row.data)) throw new Error('Each document needs path and object data.');
  if (row.path.split('/').length % 2 !== 0) throw new Error(`Document path must have an even segment count: ${row.path}`);
  if (paths.has(row.path)) throw new Error(`Duplicate document path: ${row.path}`);
  paths.add(row.path);
}

const summary = payload.documents.reduce((result, row) => {
  const collection = row.path.split('/')[0];
  result[collection] = (result[collection] ?? 0) + 1;
  return result;
}, {});
console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', projectId, documents: payload.documents.length, collections: summary }, null, 2));
if (!apply) process.exit(0);

const app = initializeApp({ credential: applicationDefault(), projectId });
const firestore = getFirestore(app);
for (let offset = 0; offset < payload.documents.length; offset += 400) {
  const batch = firestore.batch();
  for (const row of payload.documents.slice(offset, offset + 400)) batch.set(firestore.doc(row.path), row.data, { merge: true });
  await batch.commit();
}

const verified = {};
for (const [collection, expected] of Object.entries(summary)) {
  const snapshot = await firestore.collection(collection).get();
  verified[collection] = { expectedAtLeast: expected, actual: snapshot.size, ok: snapshot.size >= expected };
}
console.log(JSON.stringify({ projectId, imported: payload.documents.length, verified }, null, 2));
