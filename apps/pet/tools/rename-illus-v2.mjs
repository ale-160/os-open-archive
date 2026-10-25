/**
 * 语义化未命名的历史素材：illus/0..23 与 vis/v2-0..39，并同步缩略图与 prompts 清单。
 * 用法：node tools/rename-illus-v2.mjs [--dry]
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(here, '..');
const publicRoot = path.join(appDir, 'public', 'skins', 'gugu');
const dry = process.argv.includes('--dry');

const ILLUS = [
  'rice-bowl', 'cozy-bed', 'desk-sunset', 'hot-spring', 'sunrise-window', 'night-city-window',
  'picnic-blanket', 'train-window', 'mountain-trail', 'beach-umbrella', 'forest-fireflies', 'snow-window',
  'wax-letter', 'photo-album', 'knitted-scarf', 'umbrella-pair', 'rain-boots', 'star-map',
  'birthday-cake', 'first-aid-kit', 'lucky-wallet', 'game-controller', 'bookshelf-cat', 'window-box',
];

const VIS = [
  'chinchilla', 'capybara', 'red-panda', 'alpaca', 'pigeon', 'woodpecker', 'kingfisher', 'flamingo',
  'swan', 'seagull', 'octopus', 'seahorse', 'starfish', 'hermit-crab', 'shrimp', 'whale',
  'dolphin', 'shark', 'butterfly-green', 'beetle-rhinoceros', 'ant', 'spider', 'worm', 'snail-brown',
  'slug', 'lizard-green', 'chameleon', 'gecko', 'axolotl', 'clownfish', 'pufferfish-green', 'eel',
  'parakeet', 'cockatiel', 'canary', 'finch', 'robin', 'sparrow-gray', 'moth-pink', 'dragonfly-blue',
];

if (ILLUS.length !== 24 || VIS.length !== 40) throw new Error('名单数量异常');

let renamed = 0;
let missing = 0;
const maybeRename = (from, to) => {
  console.log(`${path.basename(from)} → ${path.basename(to)}`);
  if (dry) return;
  if (!existsSync(from)) { missing++; return; }
  if (existsSync(to)) throw new Error(`目标已存在：${to}`);
  renameSync(from, to);
  renamed++;
};

for (const base of [publicRoot, path.join(publicRoot, 'thumb')]) {
  ILLUS.forEach((name, i) => maybeRename(path.join(base, 'illus', `${i}.png`), path.join(base, 'illus', `${name}.png`)));
  VIS.forEach((name, i) => maybeRename(path.join(base, 'vis', `v2-${i}.png`), path.join(base, 'vis', `${name}.png`)));
}

if (!dry) {
  const map = new Map();
  ILLUS.forEach((name, i) => map.set(`illus-${i}`, `illus/${name}.png`));
  VIS.forEach((name, i) => map.set(`vis2-${i}`, `vis/${name}.png`));
  for (const file of ['prompts.json', 'prompts-batch4.json']) {
    const p = path.join(here, file);
    if (!existsSync(p)) continue;
    const data = JSON.parse(readFileSync(p, 'utf8'));
    let changed = 0;
    for (const a of data.assets) {
      const target = map.get(a.key);
      if (target && a.file !== target) { a.file = target; changed++; }
    }
    if (changed) writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
    console.log(`${file} 更新 ${changed} 条`);
  }
}
console.log(`\n${dry ? '（dry-run）' : ''}重命名 ${renamed}，缺失 ${missing}`);
