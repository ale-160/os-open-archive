/**
 * R2 批量补传（REST API 直传版）：绕过逐文件 spawn npx wrangler 的开销。
 * 清单 tools/.r2-remaining.txt（逗号或换行分隔，每项为含 gugu/ 前缀的 key），
 * 本地文件在 public/skins/gugu/<去掉 gugu/ 前缀>。
 * OAuth token 从 wrangler 配置 (~/AppData/Roaming/xdg.config/.wrangler/config/default.toml) 读取，不落仓库。
 * 用法：node tools/upload-r2-rest.mjs <清单文件>
 */
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const listFile = process.argv[2];
if (!listFile || !existsSync(listFile)) {
  console.error('用法: node tools/upload-r2-rest.mjs <清单文件>');
  process.exit(1);
}

const ACCOUNT_ID = '43d1f6bf5780f28d866397b1756b867f';
const BUCKET = 'public';
const cfgPath = path.join(os.homedir(), 'AppData', 'Roaming', 'xdg.config', '.wrangler', 'config', 'default.toml');
const cfg = readFileSync(cfgPath, 'utf8');
const TOKEN = (cfg.match(/oauth_token\s*=\s*"([^"]*)"/) || [])[1];
if (!TOKEN) { console.error('未找到 wrangler oauth_token'); process.exit(1); }
const exp = (cfg.match(/expiration_time\s*=\s*"([^"]*)"/) || [])[1];
console.log('token 过期时间:', exp);

const keys = readFileSync(listFile, 'utf8').split(/[\r\n,]+/).map(s => s.trim()).filter(Boolean);
console.log(`待上传 ${keys.length} 个`);

const CONCURRENCY = 12;
let idx = 0;
let ok = 0;
const fail = [];

async function putOnce(key) {
  const local = path.join(here, '..', 'public', 'skins', 'gugu', key.replace(/^gugu\//, ''));
  if (!existsSync(local)) throw new Error('no local file');
  const body = readFileSync(local);
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET}/objects/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'image/png' },
    body,
  });
  const text = await res.text();
  if (!res.ok || !text.includes('"success":true')) {
    const e = new Error(`HTTP ${res.status}: ${text.slice(0, 120)}`);
    e.status = res.status;
    throw e;
  }
}

async function worker() {
  while (true) {
    const i = idx++;
    if (i >= keys.length) return;
    const key = keys[i];
    let done = false;
    for (let attempt = 1; attempt <= 3 && !done; attempt++) {
      try {
        await putOnce(key);
        done = true;
        ok++;
        if (ok % 50 === 0) console.log(`进度 ${ok}/${keys.length}`);
      } catch (e) {
        if (e.status === 401 || /authentication/i.test(e.message)) {
          console.error(`FATAL ${key}: token 失效 (${e.message})`);
          fail.push(key);
          return; // token 失效，直接放弃剩余重试
        }
        if (attempt === 3) {
          fail.push(key);
          console.error(`FAIL ${key}: ${e.message}`);
        }
      }
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
console.log(`完成 ${ok}/${keys.length}，失败 ${fail.length}`);
if (fail.length) {
  writeFileSync(path.join(here, '.r2-failed.txt'), fail.join(','));
  console.log('失败清单 → tools/.r2-failed.txt');
}
