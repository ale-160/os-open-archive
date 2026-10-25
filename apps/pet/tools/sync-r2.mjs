/**
 * R2 素材差异同步（开发期工具，禁止在 CI/前端运行）
 *
 * 用法：node tools/sync-r2.mjs [--dry]
 *
 * - 读取 wrangler OAuth token（%APPDATA%/xdg.config/.wrangler/config/default.toml）
 * - 列举桶 public 内 gugu/ 前缀的全部对象（分页），与本地 public/skins/gugu 对比
 * - 补传缺失或大小不一致的文件（REST 直传，幂等；同一对象重复上传无副作用）
 * - --dry 只打印差异不写
 */
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(here, '..');
const localRoot = path.join(appDir, 'public', 'skins', 'gugu');
const PREFIX = 'gugu/';
const BUCKET = 'public';
const ACCOUNT = '43d1f6bf5780f28d866397b1756b867f';
const WRANGLER_CLIENT_ID = '54d11594-84e4-41aa-b438-e81b8fa78ee7';

const CONFIG_CANDIDATES = [
  path.join(process.env.APPDATA || '', 'xdg.config', '.wrangler', 'config', 'default.toml'),
  path.join(os.homedir(), '.config', '.wrangler', 'config', 'default.toml'),
];

function findConfig() {
  return CONFIG_CANDIDATES.find((p) => existsSync(p)) ?? null;
}

const envToken = (process.env.CLOUDFLARE_API_TOKEN || '').trim();
const configPath = envToken ? null : findConfig();
if (!envToken && !configPath) {
  console.error('未找到 wrangler 配置（先 npx wrangler login），或设置 CLOUDFLARE_API_TOKEN');
  process.exit(1);
}
let configText = configPath ? readFileSync(configPath, 'utf8') : '';
let token = envToken || (configText.match(/oauth_token\s*=\s*"([^"]+)"/) || [])[1];
let refreshToken = (configText.match(/refresh_token\s*=\s*"([^"]+)"/) || [])[1];
const expiration = (configText.match(/expiration_time\s*=\s*"([^"]+)"/) || [])[1];
if (!token) {
  console.error('wrangler 配置缺少 oauth_token（先 npx wrangler login），或设置 CLOUDFLARE_API_TOKEN');
  process.exit(1);
}

function formPost(hostname, pathname, form) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(form).toString();
    const req = https.request(
      {
        hostname,
        path: pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
          'User-Agent': 'curl/8',
        },
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, json: JSON.parse(d) });
          } catch {
            reject(new Error(`OAuth 响应无法解析：${d.slice(0, 120)}`));
          }
        });
      },
    );
    req.on('error', reject);
    req.setTimeout(60_000, () => reject(new Error('OAuth 超时')));
    req.end(body);
  });
}

/** wrangler OAuth token 约 1 小时过期：过期前用 refresh_token 续期并写回配置 */
async function ensureFreshToken() {
  if (envToken) return; // API Token 不涉及 OAuth 续期
  if (!expiration) return;
  const left = Date.parse(expiration) - Date.now();
  if (left > 120_000) return;
  if (!refreshToken) {
    console.error('token 已过期且没有 refresh_token（重新 npx wrangler login）');
    process.exit(1);
  }
  const r = await formPost('dash.cloudflare.com', '/oauth2/token', {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: WRANGLER_CLIENT_ID,
  });
  if (r.status !== 200 || !r.json.access_token) {
    console.error('token 续期失败：', r.status, JSON.stringify(r.json).slice(0, 160));
    process.exit(1);
  }
  token = r.json.access_token;
  refreshToken = r.json.refresh_token ?? refreshToken;
  const nextExpiry = new Date(Date.now() + (r.json.expires_in ?? 3600) * 1000).toISOString();
  configText = configText
    .replace(/oauth_token\s*=\s*"[^"]*"/, `oauth_token="${token}"`)
    .replace(/refresh_token\s*=\s*"[^"]*"/, `refresh_token="${refreshToken}"`)
    .replace(/expiration_time\s*=\s*"[^"]*"/, `expiration_time="${nextExpiry}"`);
  writeFileSync(configPath, configText);
  console.log('OAuth token 已续期');
}

await ensureFreshToken();

function api(method, pathname, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: 'api.cloudflare.com',
        path: `/client/v4${pathname}`,
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'curl/8',
          ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, json: JSON.parse(d) });
          } catch {
            resolve({ status: res.statusCode, raw: d });
          }
        });
      },
    );
    req.on('error', reject);
    req.setTimeout(120_000, () => reject(new Error('timeout')));
    req.end(data ?? undefined);
  });
}

async function listRemote() {
  const keys = new Map();
  let cursor = null;
  for (let page = 0; page < 100; page++) {
    const q = `prefix=${encodeURIComponent(PREFIX)}&per_page=1000${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
    const r = await api('GET', `/accounts/${ACCOUNT}/r2/buckets/${BUCKET}/objects?${q}`);
    if (r.status !== 200 || !r.json?.success) throw new Error('列举失败：' + (r.raw ?? JSON.stringify(r.json?.errors)));
    for (const o of r.json.result) keys.set(o.key, o.size);
    cursor = r.json.result_info?.cursor ?? r.json.result_info?.next_cursor ?? null;
    if (!cursor) break;
  }
  return keys;
}

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'thumb') continue; // 缩略图仅本地使用，不上传
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(png|jpe?g|webp|svg|json)$/i.test(e.name)) out.push(p);
  }
  return out;
}

const dry = process.argv.includes('--dry');
const prune = process.argv.includes('--prune');

const remote = await listRemote();
const local = walk(localRoot);
const localKeys = new Set();
const todo = [];
for (const p of local) {
  const rel = path.relative(localRoot, p).split(path.sep).join('/');
  const key = PREFIX + rel;
  localKeys.add(key);
  const size = statSync(p).size;
  if (!remote.has(key) || remote.get(key) !== size) todo.push({ p, key });
}
const stale = prune ? [...remote.keys()].filter((k) => !localKeys.has(k) && !k.includes('/thumb/')) : [];
console.log(`R2 对象 ${remote.size}，本地 ${local.length}，待传 ${todo.length}${prune ? `，待清理 ${stale.length}` : ''}`);
if (dry) {
  if (prune) console.log('待清理（前 30）：', stale.slice(0, 30).join('\n'));
  process.exit(0);
}
if (todo.length === 0 && !prune) process.exit(0);

writeFileSync(path.join(here, '.r2-sync-todo.txt'), todo.map((t) => t.key).join('\n'));
let ok = 0;
let fail = 0;
let idx = 0;
async function worker() {
  while (idx < todo.length) {
    const t = todo[idx++];
    try {
      const b64 = readFileSync(t.p).toString('base64');
      const r = await api('PUT', `/accounts/${ACCOUNT}/r2/buckets/${BUCKET}/objects/${encodeURIComponent(t.key)}`, { body: b64 });
      if (r.status === 200 && r.json?.success) {
        ok++;
        if (ok % 25 === 0) console.log(`进度 ${ok}/${todo.length}`);
      } else {
        fail++;
        console.error('失败', t.key, r.status, JSON.stringify(r.json?.errors ?? {}).slice(0, 120));
      }
    } catch (e) {
      fail++;
      console.error('错误', t.key, e.message);
    }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
console.log(`完成 ${ok}/${todo.length}，失败 ${fail}${fail ? `（清单见 ${path.join(here, '.r2-sync-todo.txt')}）` : ''}`);
process.exitCode = fail ? 1 : 0;

if (prune && stale.length > 0) {
  let deleted = 0;
  let dfail = 0;
  let si = 0;
  async function pruneWorker() {
    while (si < stale.length) {
      const key = stale[si++];
      try {
        const r = await api('DELETE', `/accounts/${ACCOUNT}/r2/buckets/${BUCKET}/objects/${encodeURIComponent(key)}`);
        if (r.status === 200 && r.json?.success) {
          deleted++;
          if (deleted % 25 === 0) console.log(`清理 ${deleted}/${stale.length}`);
        } else {
          dfail++;
          console.error('清理失败', key, r.status, JSON.stringify(r.json?.errors ?? {}).slice(0, 120));
        }
      } catch (e) {
        dfail++;
        console.error('清理错误', key, e.message);
      }
    }
  }
  await Promise.all(Array.from({ length: 8 }, pruneWorker));
  console.log(`清理完成 ${deleted}/${stale.length}，失败 ${dfail}`);
  if (dfail) process.exitCode = 1;
}