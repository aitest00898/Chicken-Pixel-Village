import { readdir, readFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const wearableRoot = resolve(repoRoot, 'apps/mobile/public/assets/art/vanadis/equipment/wearable');
const includeDrafts = process.argv.includes('--include-drafts');
const expectedWidth = 410;
const expectedHeight = 690;

async function listPngs(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    const paths = await Promise.all(entries.map((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return listPngs(path);
      return entry.isFile() && entry.name.endsWith('.png') ? [path] : [];
    }));
    return paths.flat();
  } catch {
    return [];
  }
}

function readUInt32(buffer, offset) {
  return buffer.readUInt32BE(offset);
}

function parsePng(buffer) {
  const signature = buffer.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a') throw new Error('not a PNG file');
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];
  while (offset < buffer.length) {
    const length = readUInt32(buffer, offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += length + 12;
    if (type === 'IHDR') {
      width = readUInt32(data, 0);
      height = readUInt32(data, 4);
      bitDepth = data[8];
      colorType = data[9];
    }
    if (type === 'IDAT') idat.push(data);
    if (type === 'IEND') break;
  }
  if (bitDepth !== 8 || colorType !== 6) throw new Error(`unsupported PNG encoding: bitDepth=${bitDepth}, colorType=${colorType}; expected 8-bit RGBA`);
  const inflated = inflateSync(Buffer.concat(idat));
  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const pixels = Buffer.alloc(width * height * bytesPerPixel);
  let source = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = inflated[source];
    source += 1;
    for (let x = 0; x < stride; x += 1) {
      const raw = inflated[source + x];
      const left = x >= bytesPerPixel ? pixels[y * stride + x - bytesPerPixel] : 0;
      const up = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const upLeft = y > 0 && x >= bytesPerPixel ? pixels[(y - 1) * stride + x - bytesPerPixel] : 0;
      let value;
      if (filter === 0) value = raw;
      else if (filter === 1) value = raw + left;
      else if (filter === 2) value = raw + up;
      else if (filter === 3) value = raw + Math.floor((left + up) / 2);
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        value = raw + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft);
      } else {
        throw new Error(`unsupported PNG filter ${filter}`);
      }
      pixels[y * stride + x] = value & 0xff;
    }
    source += stride;
  }
  return { width, height, pixels };
}

function pixelAt(image, x, y) {
  const index = (y * image.width + x) * 4;
  return {
    r: image.pixels[index],
    g: image.pixels[index + 1],
    b: image.pixels[index + 2],
    a: image.pixels[index + 3],
  };
}

function validateImage(image) {
  const issues = [];
  if (image.width !== expectedWidth || image.height !== expectedHeight) issues.push(`size ${image.width}x${image.height}, expected ${expectedWidth}x${expectedHeight}`);
  const corners = [
    pixelAt(image, 0, 0),
    pixelAt(image, image.width - 1, 0),
    pixelAt(image, 0, image.height - 1),
    pixelAt(image, image.width - 1, image.height - 1),
  ];
  if (corners.some((pixel) => pixel.a > 4)) issues.push('canvas corners are not transparent');
  let opaquePixels = 0;
  let greenFringePixels = 0;
  for (let index = 0; index < image.pixels.length; index += 4) {
    const r = image.pixels[index];
    const g = image.pixels[index + 1];
    const b = image.pixels[index + 2];
    const a = image.pixels[index + 3];
    if (a > 12) {
      opaquePixels += 1;
      if (g > 120 && g > r * 1.45 && g > b * 1.45) greenFringePixels += 1;
    }
  }
  if (opaquePixels === 0) issues.push('no visible wearable pixels');
  const fringeRatio = opaquePixels === 0 ? 0 : greenFringePixels / opaquePixels;
  if (greenFringePixels > 40 && fringeRatio > 0.0025) issues.push(`green fringe pixels ${greenFringePixels}/${opaquePixels} (${(fringeRatio * 100).toFixed(2)}%)`);
  return issues;
}

const allPngs = await listPngs(wearableRoot);
const candidates = allPngs.filter((path) => includeDrafts || !path.includes('/draft/'));
if (candidates.length === 0) {
  console.log(includeDrafts ? 'No wardrobe wearable PNG assets found.' : 'No committed wardrobe wearable PNG assets found outside draft folders.');
  process.exit(0);
}

let failed = false;
for (const path of candidates) {
  const label = relative(repoRoot, path);
  try {
    const image = parsePng(await readFile(path));
    const issues = validateImage(image);
    if (issues.length) {
      failed = true;
      console.error(`FAIL ${label}: ${issues.join('; ')}`);
    } else {
      console.log(`PASS ${label}`);
    }
  } catch (error) {
    failed = true;
    console.error(`FAIL ${label}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failed) process.exit(1);
