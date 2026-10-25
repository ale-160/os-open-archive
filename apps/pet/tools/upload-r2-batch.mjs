/**
 * R2 批量补传（按清单文件，并发 6 路）：tools/.r2-remaining.txt 每行一个 key（含 gugu/ 前缀），
 * 本地文件在 public/skins/gugu/<去掉 gugu/ 前缀>。用法：node tools/upload-r2-batch.mjs <清单文件>
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const listFile = process.argv[2];
if (!listFile || !existsSync(listFile)) {
  console.error('用法: node tools/upload-r2-batch.mjs <清单文件>');
  process.exit(1);
}
const keys = readFileSync(listFile, 'utf8').split(/[\r\n,]+/).map(s => s.trim()).filter(Boolean);
console.log(`待上传 ${keys.length} 个`);

const CONCURRENCY = 6;
let idx = 0;
let ok = 0;
let fail = [];

async function worker() {
  while (true) {
    const i = idx++;
    if (i >= keys.length) return;
    const key = keys[i];
    const local = path.join(here, '..', 'public', 'skins', 'gugu', key.replace(/^gugu\//, ''));
    if (!existsSync(local)) { fail.push(key + ' (no local)'); continue; }
    const r = spawnSync('npx', ['wrangler', 'r2', 'object', 'put', '--remote', `public/${key}`, '--file', local, '--content-type', 'image/png'], { stdio: 'pipe', shell: process.platform === 'win32' });
    if (r.status === 0) {
      ok++;
      if (ok % 25 === 0) console.log(`进度 ${ok}/${keys.length}`);
    } else {
      fail.push(key);
      console.error(`FAIL ${key}: ${(r.stderr || '').toString().slice(0, 80)}`);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
console.log(`完成 ${ok}/${keys.length}，失败 ${fail.length}`);
if (fail.length) {
  writeFileSync(path.join(here, '.r2-failed.txt'), fail.join('\n'));
  console.log('失败清单 → tools/.r2-failed.txt');
}
