import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(repoRoot, 'docs/generated');
const tmpDir = resolve(repoRoot, 'node_modules/.wardrobe-export');

async function transpileDomainModule(sourceRelativePath, outputFileName) {
  const sourcePath = resolve(repoRoot, sourceRelativePath);
  const source = await readFile(sourcePath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: true,
    },
    fileName: sourcePath,
  }).outputText
    .replaceAll("from './fixtures'", "from './fixtures.mjs'")
    .replaceAll('from "./fixtures"', 'from "./fixtures.mjs"');
  await writeFile(resolve(tmpDir, outputFileName), transpiled);
}

function promptFor(entry) {
  if (entry.characterId !== 'manager-male') return '';
  if (entry.itemId === 'straw-hat') return '以海登 manager-male-full.png 為姿勢與頭部角度基準，製作晨巡草帽 head-equipment-front 透明圖層。只輸出帽子與必要接觸陰影；帽冠套住頭頂，帽簷遮住額頭與上緣頭髮；完整 410x690 透明 PNG，0,0 對齊。';
  if (entry.itemId === 'work-jacket') return '以海登 manager-male-full.png 為身份、臉部、比例與站姿基準，製作霧綠工作外套 body-variant。保留臉、頭髮、手勢與靴子位置；工作外套遮蔽原外衣，不得雙重衣領/袖口/下襬；完整 410x690 透明 PNG。';
  if (entry.itemId === 'field-pack') return '以海登 manager-male-full.png 為姿勢基準，製作田野背包 backpack-back 與 front-straps 兩個透明圖層。後層只含背包本體，前層只含肩帶/胸帶/扣具；完整 410x690 透明 PNG，0,0 對齊。';
  if (entry.itemId === 'feed-scoop') return '海登目前基礎姿勢不適合直接持舊銅飼料勺。需另製 manager-male-feed-scoop-grip pose variant 與手掌遮罩；工具握柄必須進入手掌，不得懸浮。';
  return '';
}

function toMarkdown(matrix) {
  const lines = [
    '# Wardrobe Character Equipment Matrix',
    '',
    'Generated from `packages/domain/src/wardrobe.ts` via `scripts/export-wardrobe-matrix.mjs`.',
    '',
    '| characterId | itemId | usageType | slot | wearable | compatible | requiredLayers | requiresMask | requiresBodyVariant | requiresPoseVariant | assetStatus | implementationStatus | visualVerificationStatus | notes |',
    '|---|---|---|---|---:|---:|---|---:|---:|---:|---|---|---|---|',
  ];
  for (const entry of matrix) {
    lines.push([
      entry.characterId,
      entry.itemId,
      entry.usageType,
      entry.slot ?? '',
      String(entry.wearable),
      String(entry.compatible),
      entry.requiredLayers.join('+') || '-',
      String(entry.requiresMask),
      String(entry.requiresBodyVariant),
      String(entry.requiresPoseVariant),
      entry.assetStatus,
      entry.implementationStatus,
      entry.visualVerificationStatus,
      entry.notes.replaceAll('|', '／'),
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
  }
  lines.push('', '## Hayden first-pass prompts', '');
  for (const entry of matrix.filter((row) => row.characterId === 'manager-male' && ['straw-hat', 'work-jacket', 'field-pack', 'feed-scoop'].includes(row.itemId))) {
    lines.push(`### ${entry.characterId} × ${entry.itemId}`, '', promptFor(entry), '');
  }
  return `${lines.join('\n')}\n`;
}

await rm(tmpDir, { recursive: true, force: true });
await mkdir(tmpDir, { recursive: true });
await mkdir(outDir, { recursive: true });
await transpileDomainModule('packages/domain/src/fixtures.ts', 'fixtures.mjs');
await transpileDomainModule('packages/domain/src/wardrobe.ts', 'wardrobe.mjs');

const { wardrobeMatrixEntries } = await import(pathToFileURL(resolve(tmpDir, 'wardrobe.mjs')).href);
const matrix = wardrobeMatrixEntries();
await writeFile(resolve(outDir, 'wardrobe-matrix.json'), `${JSON.stringify(matrix, null, 2)}\n`);
await writeFile(resolve(outDir, 'wardrobe-matrix.md'), toMarkdown(matrix));
console.log(`Wrote ${matrix.length} wardrobe matrix rows to ${join('docs', 'generated', 'wardrobe-matrix.json')}`);
