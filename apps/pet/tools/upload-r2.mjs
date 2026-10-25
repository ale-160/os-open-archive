/**
 * R2 批量上传：apps/pet/public/skins/gugu/** → gugu 桶 public/gugu/**
 * 逐个 wrangler r2 object put（仅开发期备份用；公共访问待 dashboard 开启）。
 * 用法：node tools/upload-r2.mjs [--dry]
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', 'public', 'skins', 'gugu');
const dry = process.argv.includes('--dry');
const manifest = [];

function walk(dir, prefix = '') {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    if (statSync(full).isDirectory()) walk(full, rel);
    else manifest.push({ full, rel });
  }
}
walk(root);
console.log(`待上传 ${manifest.length} 个文件`);
if (dry) {
  writeFileSync(path.join(here, '.r2-manifest.json'), JSON.stringify(manifest, null, 2));
  process.exit(0);
}

let ok = 0;
for (const { full, rel } of manifest) {
  const ext = path.extname(rel).toLowerCase();
  const ct = ext === '.png' ? 'image/png' : ext === '.mp3' ? 'audio/mpeg' : 'application/octet-stream';
  const r = spawnSync('npx', ['wrangler', 'r2', 'object', 'put', '--remote', `public/gugu/${rel}`, '--file', full, '--content-type', ct], {
    stdio: 'pipe',
    shell: process.platform === 'win32',
  });
  if (r.status === 0) ok++;
  else console.log(`失败: ${rel}`);
  if ((ok + 0) % 50 === 1) console.log(`进度 ${ok}/${manifest.length}`);
}
console.log(`完成 ${ok}/${manifest.length}`);
