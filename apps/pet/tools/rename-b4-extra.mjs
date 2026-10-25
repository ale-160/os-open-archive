/**
 * 把早期批次 acc/b4-*.png、deco/b4-*.png 重命名为语义文件名（按 prompts.json 里的描述），
 * 并同步更新 prompts.json 的 file 字段。仅开发期使用。
 *
 * 用法：node tools/rename-b4-extra.mjs [--dry]
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(here, '..');
const publicRoot = path.join(appDir, 'public', 'skins', 'gugu');
const promptsFile = path.join(here, 'prompts.json');
const dry = process.argv.includes('--dry');

const STOP = new Set([
  'a', 'an', 'cute', 'tiny', 'little', 'small', 'soft', 'fluffy', 'pastel', 'shiny',
  'glossy', 'round', 'cozy', 'mini', 'miniature', 'adorable', 'kawaii',
]);
const BREAK = new Set(['with', 'in', 'on', 'for', 'of', 'and', 'or', 'at', 'by', 'from']);

function slugifyPrompt(prompt) {
  const head = prompt.split(',')[0].toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
  const words = head.split(/\s+/).filter(Boolean).filter((w) => !STOP.has(w));
  const out = [];
  for (const w of words) {
    if (BREAK.has(w) && out.length >= 2) break;
    out.push(w);
    if (out.length >= 5) break;
  }
  return out.join('-') || 'asset';
}

const slugOf = (en) =>
  en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// 已占用的语义文件名：磁盘上已有的 + 第 5 批（b4b）将使用的
const used = new Set();
const w3 = readFileSync(path.join(here, '..', 'src', 'lib', 'wardrobe-batch3.ts'), 'utf8');
const [accSection, decoSection] = w3.split('const DECO_ROWS');
for (const m of accSection.matchAll(/\[\d+, '[^']*', '([^']*)'/g)) used.add(`acc/${slugOf(m[1])}`);
for (const m of decoSection.matchAll(/\[\d+, '[^']*', '([^']*)'/g)) used.add(`deco/${slugOf(m[1])}`);

const data = JSON.parse(readFileSync(promptsFile, 'utf8'));
const targets = data.assets.filter((a) => /^(acc|deco)-b4-\d+$/.test(a.key));
const plan = [];
for (const a of targets) {
  const dir = a.file.startsWith('acc/') ? 'acc' : 'deco';
  const base = slugifyPrompt(a.prompt);
  let slug = base;
  let n = 2;
  while (used.has(`${dir}/${slug}`) || existsSync(path.join(publicRoot, dir, `${slug}.png`))) {
    slug = `${base}-${n++}`;
  }
  used.add(`${dir}/${slug}`);
  plan.push({
    asset: a,
    from: path.join(publicRoot, a.file),
    to: `${dir}/${slug}.png`,
    toPath: path.join(publicRoot, dir, `${slug}.png`),
  });
}

let renamed = 0;
let missing = 0;
for (const p of plan) {
  console.log(`${p.asset.key}  ${p.asset.file} → ${p.to}`);
  if (dry) continue;
  if (!existsSync(p.from)) {
    missing++;
    continue;
  }
  renameSync(p.from, p.toPath);
  p.asset.file = p.to;
  renamed++;
}
if (!dry) writeFileSync(promptsFile, JSON.stringify(data, null, 2) + '\n');
console.log(`\n${dry ? '（dry-run）' : ''}计划 ${plan.length}，重命名 ${renamed}，缺失 ${missing}`);