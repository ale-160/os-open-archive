/**
 * 咕咕 GuGu 素材生成工具（仅开发期使用，禁止在 CI/前端运行）
 *
 * 用法：node tools/gen-assets.mjs [--only key1,key2] [--size 512]
 *
 * - 从 apps/pet/.env.local 读取 OPENAI_NEXT_API_KEY / OPENAI_NEXT_BASE_URL（绝不回显）
 * - 调 POST /v1/images/generations（OpenAI 兼容）按 tools/prompts.json 批量出图
 * - 后处理：PNG 解码 → 已透明则跳过 / 白底则 flood-fill 抠图 → 按内容裁切 + 4% 留白 → 双线性缩放 → 写入 public/skins/gugu/
 * - 原图备份到仓库根 .asset-tmp/raw/（点目录已被 .gitignore 忽略）
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { deflateSync, inflateSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(here, '..');
const repoRoot = path.resolve(appDir, '..', '..');
const outDir = path.join(appDir, 'public', 'skins', 'gugu');
const rawDir = path.join(repoRoot, '.asset-tmp', 'raw');

// ---------- 配置加载 ----------
function loadEnv() {
  const envPath = path.join(appDir, '.env.local');
  if (!existsSync(envPath)) {
    console.error('缺少 apps/pet/.env.local（OPENAI_NEXT_API_KEY）');
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
    if (m && !line.trim().startsWith('#')) env[m[1]] = m[2];
  }
  if (!env.OPENAI_NEXT_API_KEY) {
    console.error('.env.local 缺少 OPENAI_NEXT_API_KEY');
    process.exit(1);
  }
  return env;
}

// ---------- PNG 编解码（8bit RGB→RGBA / RGBA，非隔行） ----------
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('不是 PNG');
  let pos = 8;
  let w = 0, h = 0, bitDepth = 0, colorType = 0, interlace = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      bitDepth = data[8]; colorType = data[9]; interlace = data[12];
    } else if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  if (bitDepth !== 8 || interlace !== 0 || (colorType !== 6 && colorType !== 2)) {
    throw new Error(`不支持的 PNG：depth=${bitDepth} colorType=${colorType} interlace=${interlace}`);
  }
  const bpp = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idat));
  const stride = w * bpp;
  const pixels = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(stride);
  let cur = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const off = y * (stride + 1);
    const filter = raw[off];
    raw.copy(cur, 0, off + 1, off + 1 + stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      switch (filter) {
        case 1: cur[x] = (cur[x] + a) & 0xff; break;
        case 2: cur[x] = (cur[x] + b) & 0xff; break;
        case 3: cur[x] = (cur[x] + ((a + b) >> 1)) & 0xff; break;
        case 4: {
          const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          cur[x] = (cur[x] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
          break;
        }
      }
    }
    for (let x = 0; x < w; x++) {
      const si = x * bpp, di = (y * w + x) * 4;
      pixels[di] = cur[si];
      pixels[di + 1] = cur[si + 1];
      pixels[di + 2] = cur[si + 2];
      pixels[di + 3] = bpp === 4 ? cur[si + 3] : 255;
    }
    const t = prev; prev = cur; cur = t;
  }
  return { w, h, pixels };
}
function encodePng(w, h, pixels) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------- 抠图 / 裁切 / 缩放 ----------
/**
 * 底色 flood-fill 抠图：从四边出发，把与四角底色相近的连通区域清成透明
 * （白底/黑底通吃；只处理边缘连通区域，保留主体内部的同色高光）。
 */
function floodFillBackground(img) {
  const { w, h, pixels } = img;
  const corner = (x, y) => (y * w + x) * 4;
  const samples = [corner(0, 0), corner(w - 1, 0), corner(0, h - 1), corner(w - 1, h - 1)];
  const bg = [0, 1, 2].map((ch) => samples.reduce((s, i) => s + pixels[i + ch], 0) / samples.length);
  const isBg = (i) =>
    Math.abs(pixels[i] - bg[0]) <= 30 &&
    Math.abs(pixels[i + 1] - bg[1]) <= 30 &&
    Math.abs(pixels[i + 2] - bg[2]) <= 30;
  const visited = new Uint8Array(w * h);
  const queue = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (visited[p]) return;
    const i = p * 4;
    if (pixels[i + 3] >= 10 && !isBg(i)) return;
    visited[p] = 1;
    pixels[i] = 255;
    pixels[i + 1] = 255;
    pixels[i + 2] = 255;
    pixels[i + 3] = 0;
    queue.push(p);
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (queue.length) {
    const p = queue.pop();
    const x = p % w, y = (p / w) | 0;
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  return img;
}
/** 内容包围盒（alpha > 24） */
function contentBBox(img) {
  const { w, h, pixels } = img;
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (pixels[(y * w + x) * 4 + 3] > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error('整图透明');
  return { minX, minY, maxX, maxY };
}
function crop(img, bbox, padRatio = 0.04) {
  const pad = Math.round(Math.max(bbox.maxX - bbox.minX, bbox.maxY - bbox.minY) * padRatio);
  const x0 = Math.max(0, bbox.minX - pad), y0 = Math.max(0, bbox.minY - pad);
  const x1 = Math.min(img.w - 1, bbox.maxX + pad), y1 = Math.min(img.h - 1, bbox.maxY + pad);
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const pixels = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    img.pixels.copy(
      pixels, y * w * 4,
      ((y0 + y) * img.w + x0) * 4,
      ((y0 + y) * img.w + x1 + 1) * 4
    );
  }
  return { w, h, pixels };
}
function bilinearResize(img, target) {
  const scale = Math.min(1, target / Math.max(img.w, img.h));
  const w = Math.max(1, Math.round(img.w * scale));
  const h = Math.max(1, Math.round(img.h * scale));
  const pixels = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    const sy = ((y + 0.5) * img.h) / h - 0.5;
    const y0 = Math.max(0, Math.floor(sy)), y1 = Math.min(img.h - 1, y0 + 1), fy = sy - y0;
    for (let x = 0; x < w; x++) {
      const sx = ((x + 0.5) * img.w) / w - 0.5;
      const x0 = Math.max(0, Math.floor(sx)), x1 = Math.min(img.w - 1, x0 + 1), fx = sx - x0;
      const di = (y * w + x) * 4;
      for (let ch = 0; ch < 4; ch++) {
        const p00 = img.pixels[(y0 * img.w + x0) * 4 + ch];
        const p10 = img.pixels[(y0 * img.w + x1) * 4 + ch];
        const p01 = img.pixels[(y1 * img.w + x0) * 4 + ch];
        const p11 = img.pixels[(y1 * img.w + x1) * 4 + ch];
        const top = p00 + (p10 - p00) * fx;
        const bot = p01 + (p11 - p01) * fx;
        pixels[di + ch] = Math.round(top + (bot - top) * fy);
      }
    }
  }
  return { w, h, pixels };
}
function opaqueCorners(img) {
  const { w, h, pixels } = img;
  const at = (x, y) => pixels[(y * w + x) * 4 + 3];
  return [at(0, 0), at(w - 1, 0), at(0, h - 1), at(w - 1, h - 1)].every((a) => a > 250);
}
/** 补成透明正方形（图标类素材用） */
function padSquare(img) {
  const side = Math.max(img.w, img.h);
  const pixels = Buffer.alloc(side * side * 4);
  const x0 = Math.floor((side - img.w) / 2);
  const y0 = Math.floor((side - img.h) / 2);
  for (let y = 0; y < img.h; y++) {
    img.pixels.copy(pixels, ((y0 + y) * side + x0) * 4, y * img.w * 4, (y + 1) * img.w * 4);
  }
  return { w: side, h: side, pixels };
}

// ---------- 主流程 ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generate(env, asset) {
  const base = env.OPENAI_NEXT_BASE_URL || 'https://api.openai-next.com';
  let lastErr = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${base}/v1/images/generations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.OPENAI_NEXT_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.GEN_MODEL || 'gpt-image-2',
          prompt: asset.prompt,
          size: asset.size || '1024x1024',
          background: 'transparent',
          n: 1,
        }),
      });
      if (!res.ok) {
        lastErr = `HTTP ${res.status}`;
        await res.text().catch(() => {});
      } else {
        const json = await res.json();
        if (json.error) {
          lastErr = json.error.message || JSON.stringify(json.error);
        } else {
          const d = json.data[0];
          if (d.b64_json) return Buffer.from(d.b64_json, 'base64');
          const imgRes = await fetch(d.url);
          return Buffer.from(await imgRes.arrayBuffer());
        }
      }
    } catch (e) {
      lastErr = e.message;
    }
    if (attempt < 3) await sleep(20000 * attempt);
  }
  throw new Error(lastErr || '生成失败');
}

const args = process.argv.slice(2);
const onlyIdx = args.indexOf('--only');
const only = onlyIdx >= 0 ? args[onlyIdx + 1].split(',').map((s) => s.trim()) : null;
const localMode = args.includes('--local');
const targetSize = (() => {
  const i = args.indexOf('--size');
  return i >= 0 ? parseInt(args[i + 1], 10) : 512;
})();

const setArg = process.argv.indexOf('--set');
const setFile = setArg >= 0 ? process.argv[setArg + 1] : 'prompts.json';
const { style, assets } = JSON.parse(readFileSync(path.join(here, setFile), 'utf8'));
mkdirSync(outDir, { recursive: true });
mkdirSync(rawDir, { recursive: true });

let ok = 0;
for (const asset of assets) {
  if (only && !only.includes(asset.key)) continue;
  const outFile = path.join(outDir, asset.file);
  if (existsSync(outFile) && !only) {
    console.log(`跳过（已存在）: ${asset.file}`);
    continue;
  }
  process.stdout.write(`生成 ${asset.key}${localMode ? '（本地重处理）' : ''} ... `);
  try {
    const rawPath = path.join(rawDir, `${asset.key}.png`);
    let raw;
    if (localMode && existsSync(rawPath)) {
      raw = readFileSync(rawPath);
    } else {
      raw = await generate(loadEnv(), { ...asset, prompt: `${asset.prompt}, ${style}` });
      writeFileSync(rawPath, raw);
    }
    let img = decodePng(raw);
    if (opaqueCorners(img)) {
      img = floodFillBackground(img);
      console.log(`（底色已抠图）`);
    }
    const cropped = crop(img, contentBBox(img));
    const square = asset.square ? padSquare(cropped) : cropped;
    const resized = bilinearResize(square, targetSize);
    writeFileSync(outFile, encodePng(resized.w, resized.h, resized.pixels));
    console.log(`完成 → ${asset.file}（${resized.w}x${resized.h}）`);
    ok++;
  } catch (e) {
    console.log(`失败：${e.message}`);
  }
  if (!only) await sleep(8000);
}
console.log(`\n完成 ${ok} 个 → ${outDir}`);
