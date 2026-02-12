#!/usr/bin/env node
/**
 * Runtime smoke test: build, start dev server, fetch home page, verify no crash.
 * Run: npm run test:runtime
 * (Requires Node 18+ for fetch.)
 */

import { spawn } from 'child_process';
import { setTimeout as sleep } from 'timers/promises';

const PORT = 4200;
const BASE = `http://localhost:${PORT}`;
const MAX_WAIT_MS = 120000; // 2 min for build + serve
const POLL_MS = 2000;

async function fetchOk(url) {
  const res = await fetch(url, { redirect: 'follow' });
  return res.ok ? res.text() : null;
}

async function waitForServer() {
  const start = Date.now();
  while (Date.now() - start < MAX_WAIT_MS) {
    try {
      const body = await fetchOk(BASE);
      if (body && body.includes('app-root')) return body;
    } catch (_) {}
    await sleep(POLL_MS);
  }
  throw new Error('Server did not become ready in time');
}

async function main() {
  let serverProc = null;
  try {
    console.log('Starting dev server (ng serve)...');
    const isWin = process.platform === 'win32';
    const cmd = isWin ? 'npx ng serve --configuration=development' : 'npx';
    const args = isWin ? [] : ['ng', 'serve', '--configuration=development'];
    serverProc = spawn(cmd, args, {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    serverProc.stdout.on('data', (d) => {
      const s = d.toString();
      if (s.includes('Local:') || s.includes('localhost')) process.stdout.write(s);
    });
    serverProc.stderr.on('data', (d) => process.stderr.write(d));

    const html = await waitForServer();
    console.log('\nHome page fetched successfully.');
    if (!html.includes('app-root')) {
      console.error('Response does not contain <app-root>.');
      process.exit(1);
    }
    console.log('Smoke test passed: home page loads and contains app-root.');
    process.exit(0);
  } catch (err) {
    console.error('Smoke test failed:', err.message);
    process.exit(1);
  } finally {
    if (serverProc) {
      serverProc.kill('SIGTERM');
      await sleep(1000);
      try { serverProc.kill('SIGKILL'); } catch (_) {}
    }
  }
}

main();
