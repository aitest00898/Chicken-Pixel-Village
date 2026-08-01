import { readFile } from 'node:fs/promises';

const expectedBase = process.env.VITE_DEPLOY_TARGET === 'github-pages' ? '/Chicken-Pixel-Village/' : '/';
const index = await readFile('apps/mobile/dist/index.html', 'utf8');
const manifest = JSON.parse(await readFile('apps/mobile/dist/manifest.webmanifest', 'utf8'));

const requiredIndexPaths = [
  `href="${expectedBase}manifest.webmanifest"`,
  `href="${expectedBase}assets/icons/app-icon-192.png"`,
];
for (const path of requiredIndexPaths) {
  if (!index.includes(path)) throw new Error(`PWA index is missing ${path}`);
}
if (manifest.start_url !== './' || manifest.scope !== './' || manifest.id !== './') {
  throw new Error('PWA manifest must use paths relative to the manifest URL');
}
for (const icon of manifest.icons ?? []) {
  if (typeof icon.src !== 'string' || !icon.src.startsWith('./')) throw new Error(`PWA icon path is not relative: ${icon.src}`);
}
console.log(JSON.stringify({ expectedBase, manifest: 'relative', icons: manifest.icons?.length ?? 0 }));
