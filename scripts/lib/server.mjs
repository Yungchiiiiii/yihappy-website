// 對 dist/ 啟動 astro preview，回傳 baseUrl 與 stop()
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import net from 'node:net';
import { ASTRO_BIN, DIST, ROOT } from './files.mjs';

export function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function startPreview({ port, host = '127.0.0.1', timeout = 30_000 } = {}) {
  if (!existsSync(DIST)) throw new Error('找不到 dist/，請先執行 npm run build');
  port ??= await freePort();
  const child = spawn(process.execPath, [ASTRO_BIN, 'preview', '--host', host, '--port', String(port), '--ignore-lock'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    // Astro 7 偵測到 AI agent 環境時會把 dev／preview 改成背景程序並立刻結束；設 ASTRO_DEV_BACKGROUND／ASTRO_PREVIEW_BACKGROUND 關閉偵測，讓它留在前景
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', ASTRO_DEV_BACKGROUND: '0', ASTRO_PREVIEW_BACKGROUND: '0', FORCE_COLOR: '0' },
  });
  let log = '';
  child.stdout.on('data', (d) => (log += d));
  child.stderr.on('data', (d) => (log += d));

  const baseUrl = `http://${host}:${port}`;
  const started = Date.now();
  let ready = false;
  while (Date.now() - started < timeout) {
    if (child.exitCode !== null) throw new Error(`astro preview 提前結束（code ${child.exitCode}）\n${log}`);
    try {
      const res = await fetch(`${baseUrl}/`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {
      /* 尚未啟動 */
    }
    await sleep(200);
  }
  if (!ready) {
    child.kill('SIGKILL');
    throw new Error(`astro preview 在 ${timeout}ms 內沒有回應\n${log}`);
  }

  const stop = () =>
    new Promise((resolve) => {
      if (child.exitCode !== null) return resolve();
      child.once('exit', () => resolve());
      child.kill('SIGTERM');
      setTimeout(() => {
        if (child.exitCode === null) child.kill('SIGKILL');
      }, 3000).unref();
    });

  return { baseUrl, stop };
}
