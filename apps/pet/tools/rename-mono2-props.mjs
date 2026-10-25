/**
 * 大富翁第二季道具（骰子/棋子/卡片）mono2-prop-1..64 → 语义文件名。
 * 同步重命名 thumb/game 下的缩略图，并更新 prompts-batch4.json / prompts.json。
 * 用法：node tools/rename-mono2-props.mjs [--dry]
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(here, '..');
const gameDir = path.join(appDir, 'public', 'skins', 'gugu', 'game');
const thumbDir = path.join(appDir, 'public', 'skins', 'gugu', 'thumb', 'game');
const dry = process.argv.includes('--dry');

const NAMES = [
  ...Array.from({ length: 6 }, (_, i) => `dice-white-${i + 1}`),
  ...Array.from({ length: 6 }, (_, i) => `dice-gold-${i + 1}`),
  'meeple-mint', 'meeple-lavender', 'meeple-butter', 'meeple-coral',
  'meeple-sky', 'meeple-sage', 'meeple-peach', 'meeple-lilac',
  'token-house-green', 'token-hotel-red', 'card-chance', 'card-title-deed',
  'token-coins', 'token-chest-key', 'token-top-hat', 'token-thimble',
  'token-boot', 'token-wheelbarrow', 'token-cat', 'token-dog',
  'token-steamship', 'token-race-car', 'token-flat-iron', 'token-purse',
  'token-dice-cup', 'card-jail', 'card-free-pass', 'token-train',
  'card-lightning', 'card-water', 'card-lightbulb', 'token-trophy',
  'token-crown', 'token-pennant', 'token-map', 'token-compass',
  'token-lantern', 'card-travel-tickets', 'token-passport', 'token-suitcase',
  'token-camera', 'token-binoculars', 'token-teacup', 'token-teapot',
  'token-honey', 'coin-star', 'coin-moon', 'token-heart-gem',
  'token-clover', 'token-bell', 'token-drum', 'token-trumpet',
];
if (NAMES.length !== 64) throw new Error(`名称数量异常：${NAMES.length}`);

let renamed = 0;
let missing = 0;
for (let i = 0; i < NAMES.length; i++) {
  const fromName = `mono2-prop-${i + 1}.png`;
  const toName = `${NAMES[i]}.png`;
  for (const dir of [gameDir, thumbDir]) {
    const from = path.join(dir, fromName);
    const to = path.join(dir, toName);
    if (!existsSync(from)) {
      missing++;
      continue;
    }
    if (existsSync(to)) throw new Error(`目标已存在：${to}`);
    if (!dry) renameSync(from, to);
    renamed++;
  }
  console.log(`mono2-prop-${i + 1} → ${NAMES[i]}.png`);
}

if (!dry) {
  const map = new Map(NAMES.map((n, i) => [`game-mono2-prop-${i + 1}`, `game/${n}.png`]));
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
console.log(`\n${dry ? '（dry-run）' : ''}重命名 ${renamed}，缺失 ${missing}`);
