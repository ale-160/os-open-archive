/**
 * 生成小尺寸缩略图：public/skins/gugu 下的 PNG → public/skins/gugu/thumb 同路径
 * 图标/商店/工坊/访客/贴纸/游戏棋盘等小尺寸场景改读缩略图，避免解码 512px 原图。
 * 用法：node tools/gen-thumbs.mjs [--force]
 */
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', 'public', 'skins', 'gugu');
const thumbRoot = path.join(root, 'thumb');
const force = process.argv.includes('--force');

const WIDE_DIRS = new Set(['scene', 'illus', 'misc']);

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'thumb') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.toLowerCase().endsWith('.png')) out.push(p);
  }
  return out;
}

const files = walk(root);
let done = 0;
let skipped = 0;
let failed = 0;
let idx = 0;

async function worker() {
  while (idx < files.length) {
    const src = files[idx++];
    const rel = path.relative(root, src);
    const out = path.join(thumbRoot, rel);
    const dir = path.dirname(out);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    if (!force && existsSync(out) && statSync(out).mtimeMs > statSync(src).mtimeMs) {
      skipped++;
      continue;
    }
    const top = rel.split(path.sep)[0];
    const wide = WIDE_DIRS.has(top) || /^bg2?-/.test(path.basename(rel));
    const vf = wide
      ? 'scale=192:128:force_original_aspect_ratio=decrease'
      : 'scale=128:128:force_original_aspect_ratio=decrease,pad=128:128:(ow-iw)/2:(oh-ih)/2:color=0x00000000';
    try {
      await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', src, '-vf', vf, '-frames:v', '1', '-pix_fmt', 'rgba', out], {
        windowsHide: true,
      });
      done++;
      if (done % 100 === 0) console.log(`  进度 ${done}/${files.length - skipped}`);
    } catch (e) {
      failed++;
      console.error('失败', rel, e.message.slice(0, 120));
    }
  }
}

console.log(`生成缩略图：${files.length} 张`);
await Promise.all(Array.from({ length: 8 }, worker));
console.log(`完成 ${done}，跳过 ${skipped}，失败 ${failed} → ${thumbRoot}`);
