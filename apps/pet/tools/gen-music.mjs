/**
 * Suno BGM 生成（仅开发期）：POST /_open/suno/music/generate → 轮询 getState → 下载 MP3。
 * 曲目：白天/夜晚/雨天/庆祝。用法：node tools/gen-music.mjs [--only day,night]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(here, '..');
const outDir = path.join(appDir, 'public', 'sounds', 'bgm');

function loadEnv() {
  const env = {};
  for (const line of readFileSync(path.join(appDir, '.env.local'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
    if (m && !line.trim().startsWith('#')) env[m[1]] = m[2];
  }
  return env;
}

const TRACKS = [
  { id: 'day', prompt: 'a gentle cheerful kawaii acoustic loop: ukulele, glockenspiel, soft whistling, warm and cozy pet game background music, seamless loop, instrumental, no vocals', tags: 'cute acoustic instrumental' },
  { id: 'night', prompt: 'a calm dreamy lullaby loop: soft music box, gentle piano, warm pad, sleepy night pet game background music, seamless loop, instrumental, no vocals', tags: 'lullaby musicbox instrumental' },
  { id: 'rain', prompt: 'a cozy rainy day loop: soft piano, muted guitar, light rain mood, lo-fi warm pet game background music, seamless loop, instrumental, no vocals', tags: 'lofi rainy piano instrumental' },
  { id: 'celebration', prompt: 'a short bright festive jingle: glockenspiel, ukulele strum, hand claps, cheerful celebration for a cute pet game, instrumental, no vocals', tags: 'festive jingle instrumental' },
];

const args = process.argv.slice(2);
const onlyIdx = args.indexOf('--only');
const only = onlyIdx >= 0 ? args[onlyIdx + 1].split(',') : null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const env = loadEnv();
  const base = env.OPENAI_NEXT_BASE_URL || 'https://api.openai-next.com';
  const headers = { Authorization: `Bearer ${env.OPENAI_NEXT_API_KEY}`, 'Content-Type': 'application/json' };
  mkdirSync(outDir, { recursive: true });

  for (const track of TRACKS) {
    if (only && !only.includes(track.id)) continue;
    const outFile = path.join(outDir, `${track.id}.mp3`);
    if (existsSync(outFile)) {
      console.log(`跳过（已存在）: ${track.id}`);
      continue;
    }
    process.stdout.write(`生成 BGM ${track.id} ... `);
    try {
      const res = await fetch(`${base}/_open/suno/music/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ inputType: 10, gptDescriptionPrompt: track.prompt, mv: 'chirp-v4-5' }),
      });
      const json = await res.json();
      const taskBatchId = json?.data?.taskBatchId;
      if (!taskBatchId) {
        console.log(`失败：${JSON.stringify(json).slice(0, 200)}`);
        continue;
      }
      // 轮询（最长 8 分钟）
      let audioUrl = null;
      for (let i = 0; i < 96; i++) {
        await sleep(5000);
        const st = await fetch(`${base}/_open/suno/music/getState?taskBatchId=${taskBatchId}`, { headers });
        const sj = await st.json();
        const items = sj?.data?.items ?? [];
        if (sj?.data?.taskStatus === 'finished' || items.some((it) => it.status === 30)) {
          const ok = items.find((it) => it.status === 30);
          audioUrl = ok?.cld2AudioUrl ?? ok?.audioUrl ?? null;
          break;
        }
      }
      if (!audioUrl) {
        console.log('失败：轮询超时');
        continue;
      }
      const mp3 = await (await fetch(audioUrl)).arrayBuffer();
      writeFileSync(outFile, Buffer.from(mp3));
      console.log(`完成 → ${track.id}.mp3（${(mp3.byteLength / 1024).toFixed(0)}KB）`);
    } catch (e) {
      console.log(`失败：${e.message}`);
    }
    await sleep(8000);
  }
  console.log('BGM 生成结束 →', outDir);
}
main();
