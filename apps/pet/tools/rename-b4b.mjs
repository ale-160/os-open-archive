/**
 * 把第 5 批装扮/装饰素材 acc|deco/b4b-<n>.png 重命名为语义文件名（按 wardrobe-batch3.ts 的英文名），
 * 并同步更新 prompts-batch4.json 的 file 字段。仅开发期使用。
 *
 * 用法：node tools/rename-b4b.mjs [--dry]
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(here, '..');
const publicRoot = path.join(appDir, 'public', 'skins', 'gugu');
const promptsFile = path.join(here, 'prompts-batch4.json');
const dry = process.argv.includes('--dry');

const slugOf = (en) =>
  en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const source = readFileSync(path.join(here, '..', 'src', 'lib', 'wardrobe-batch3.ts'), 'utf8');
const [accSection, decoSection] = source.split('const DECO_ROWS');

function rows(section, dir) {
  const out = new Map();
  for (const m of section.matchAll(/\[\s*(\d+),\s*'[^']*',\s*'([^']*)'/g)) {
    out.set(Number(m[1]), `${dir}/${slugOf(m[2])}.png`);
  }
  return out;
}

const acc = rows(accSection, 'acc');
const deco = rows(decoSection, 'deco');
if (acc.size !== 80) throw new Error(`装扮行数异常：${acc.size}`);
if (deco.size !== 60) throw new Error(`装饰行数异常：${deco.size}`);

const slugs = new Set();
for (const [n, file] of [...acc, ...deco]) {
  if (slugs.has(file)) throw new Error(`语义文件名重复：${file}（b4b-${n}）`);
  slugs.add(file);
}

const prompts = JSON.parse(readFileSync(promptsFile, 'utf8'));
const fileByKey = new Map();
for (const [n, file] of acc) fileByKey.set(`acc-b4b-${n}`, file);
for (const [n, file] of deco) fileByKey.set(`deco-b4b-${n}`, file);

let renamed = 0;
let missing = 0;
for (const [n, file] of [...acc]) {
  const from = path.join(publicRoot, 'acc', `b4b-${n}.png`);
  const to = path.join(publicRoot, file);
  console.log(`acc-b4b-${n}  acc/b4b-${n}.png → ${file}`);
  if (dry) continue;
  if (!existsSync(from)) {
    missing++;
    continue;
  }
  if (existsSync(to)) throw new Error(`目标已存在：${file}`);
  renameSync(from, to);
  renamed++;
}
for (const [n, file] of [...deco]) {
  const from = path.join(publicRoot, 'deco', `b4b-${n}.png`);
  const to = path.join(publicRoot, file);
  console.log(`deco-b4b-${n}  deco/b4b-${n}.png → ${file}`);
  if (dry) continue;
  if (!existsSync(from)) {
    missing++;
    continue;
  }
  if (existsSync(to)) throw new Error(`目标已存在：${file}`);
  renameSync(from, to);
  renamed++;
}

if (!dry) {
  for (const a of prompts.assets) {
    const target = fileByKey.get(a.key);
    if (target) a.file = target;
  }
  writeFileSync(promptsFile, JSON.stringify(prompts, null, 2) + '\n');

  // 主清单（batch4 生成器会把同一批 key 合入 prompts.json）同步更新，避免以后全量重跑又生成 b4b 名
  const mainFile = path.join(here, 'prompts.json');
  if (existsSync(mainFile)) {
    const main = JSON.parse(readFileSync(mainFile, 'utf8'));
    let changed = 0;
    for (const a of main.assets) {
      const target = fileByKey.get(a.key);
      if (target && a.file !== target) {
        a.file = target;
        changed++;
      }
    }
    if (changed) writeFileSync(mainFile, JSON.stringify(main, null, 2) + '\n');
    console.log(`主清单更新 ${changed} 条`);
  }
}
console.log(`\n${dry ? '（dry-run）' : ''}计划 ${acc.size + deco.size}，重命名 ${renamed}，缺失 ${missing}`);