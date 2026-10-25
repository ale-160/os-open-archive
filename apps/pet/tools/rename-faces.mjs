/**
 * 把第 5 批表情贴纸 face/b3-1..40.png 重命名为语义文件名（按 stickers.ts 的 EXTRA_FACES 顺序），
 * 并同步更新 prompts-batch4.json / prompts.json 的 file 字段。仅开发期使用。
 *
 * 用法：node tools/rename-faces.mjs [--dry]
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(here, '..');
const publicRoot = path.join(appDir, 'public', 'skins', 'gugu', 'face');
const stickersFile = path.join(appDir, 'src', 'lib', 'stickers.ts');
const dry = process.argv.includes('--dry');

const src = readFileSync(stickersFile, 'utf8');
const block = src.match(/export const EXTRA_FACES = \[([\s\S]*?)\] as const;/)?.[1];
if (!block) throw new Error('stickers.ts 中找不到 EXTRA_FACES');
const names = [...block.matchAll(/'([^']+)'/g)].map((m) => m[1]);
if (names.length !== 40) throw new Error(`EXTRA_FACES 数量异常：${names.length}`);

let renamed = 0;
let missing = 0;
for (let i = 0; i < names.length; i++) {
  const from = path.join(publicRoot, `b3-${i + 1}.png`);
  const to = path.join(publicRoot, `${names[i]}.png`);
  console.log(`face-b3-${i + 1}  b3-${i + 1}.png → ${names[i]}.png`);
  if (dry) continue;
  if (!existsSync(from)) {
    missing++;
    continue;
  }
  if (existsSync(to)) throw new Error(`目标已存在：${names[i]}.png`);
  renameSync(from, to);
  renamed++;
}

if (!dry) {
  const map = new Map(names.map((name, i) => [`face-b3-${i + 1}`, `face/${name}.png`]));
  for (const file of ['prompts-batch4.json', 'prompts.json']) {
    const p = path.join(here, file);
    if (!existsSync(p)) continue;
    const data = JSON.parse(readFileSync(p, 'utf8'));
    let changed = 0;
    for (const a of data.assets) {
      const target = map.get(a.key);
      if (target && a.file !== target) {
        a.file = target;
        changed++;
      }
    }
    if (changed) writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
    console.log(`${file} 更新 ${changed} 条`);
  }
}
console.log(`\n${dry ? '（dry-run）' : ''}计划 ${names.length}，重命名 ${renamed}，缺失 ${missing}`);