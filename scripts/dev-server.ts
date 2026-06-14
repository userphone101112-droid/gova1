/**
 * Gova Project - Development Server Manager
 * Manages the Next.js dev server lifecycle with PID tracking and health checks.
 * Compatible with: Next.js 16.2.9, Node.js, Windows (PowerShell/CMD)
 */

import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';

// ─── Constants ───────────────────────────────────────────────────────────────
const ROOT_DIR = process.cwd();
const PID_FILE = path.join(ROOT_DIR, '.server.pid');
const LOG_FILE = path.join(ROOT_DIR, 'logs', 'dev-server.log');
const NEXT_PORT = parseInt(process.env.PORT ?? '3001', 10);
const NEXT_HOST = process.env.HOSTNAME ?? 'localhost';
const HEALTH_CHECK_TIMEOUT_MS = 30_000;
const HEALTH_CHECK_INTERVAL_MS = 1_000;

// ─── Utilities ───────────────────────────────────────────────────────────────
function ensureLogsDir(): void {
  const logsDir = path.join(ROOT_DIR, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

function log(message: string): void {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}`;
  console.log(line);

  try {
    ensureLogsDir();
    fs.appendFileSync(LOG_FILE, line + '\n', 'utf-8');
  } catch {
    // Non-critical: log file write failure should not block execution
  }
}

function logError(message: string, error?: unknown): void {
  const detail = error instanceof Error ? error.message : String(error ?? '');
  const line = detail ? `${message}: ${detail}` : message;
  console.error(`[ERROR] ${line}`);

  try {
    ensureLogsDir();
    fs.appendFileSync(LOG_FILE, `[ERROR] ${new Date().toISOString()} ${line}\n`, 'utf-8');
  } catch {
    // Non-critical
  }
}

// ─── PID Management ──────────────────────────────────────────────────────────
function getServerPid(): number | null {
  if (!fs.existsSync(PID_FILE)) return null;

  try {
    const raw = fs.readFileSync(PID_FILE, 'utf-8').trim();
    const pid = parseInt(raw, 10);
    if (isNaN(pid)) {
      fs.unlinkSync(PID_FILE);
      return null;
    }

    // Verify the process is actually running
    process.kill(pid, 0);
    return pid;
  } catch {
    // Process is not running — clean up stale PID file
    try { fs.unlinkSync(PID_FILE); } catch { /* ignore */ }
    return null;
  }
}

function savePid(pid: number): void {
  try {
    fs.writeFileSync(PID_FILE, pid.toString(), 'utf-8');
  } catch (error) {
    logError('Failed to write PID file', error);
  }
}

function removePid(): void {
  try {
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
  } catch {
    // Non-critical
  }
}

// ─── Health Check ────────────────────────────────────────────────────────────
function waitForServer(): Promise<boolean> {
  return new Promise((resolve) => {
    const start = Date.now();

    const check = () => {
      const elapsed = Date.now() - start;
      if (elapsed >= HEALTH_CHECK_TIMEOUT_MS) {
        logError(`Server did not become ready within ${HEALTH_CHECK_TIMEOUT_MS / 1000}s`);
        resolve(false);
        return;
      }

      const req = http.request(
        { host: NEXT_HOST, port: NEXT_PORT, path: '/', method: 'GET', timeout: 2000 },
        (res) => {
          if (res.statusCode !== undefined && res.statusCode < 500) {
            log(`Server is ready at http://${NEXT_HOST}:${NEXT_PORT} (${elapsed}ms)`);
            resolve(true);
          } else {
            setTimeout(check, HEALTH_CHECK_INTERVAL_MS);
          }
        }
      );

      req.on('error', () => setTimeout(check, HEALTH_CHECK_INTERVAL_MS));
      req.on('timeout', () => {
        req.destroy();
        setTimeout(check, HEALTH_CHECK_INTERVAL_MS);
      });
      req.end();
    };

    check();
  });
}

// ─── Server Lifecycle ────────────────────────────────────────────────────────
function startServer(): void {
  const existingPid = getServerPid();
  if (existingPid) {
    log(`Server is already running (PID: ${existingPid}) → http://${NEXT_HOST}:${NEXT_PORT}`);
    return;
  }

  log('Starting Gova development server...');

  ensureLogsDir();
  const logStream = fs.openSync(LOG_FILE, 'a');

  const server = spawn(
    'node',
    ['node_modules/.bin/next', 'dev', '--port', String(NEXT_PORT), '--hostname', NEXT_HOST],
    {
      cwd: ROOT_DIR,
      detached: true,
      stdio: ['ignore', logStream, logStream],
      env: {
        ...process.env,
        NODE_ENV: 'development',
        PORT: String(NEXT_PORT),
        HOSTNAME: NEXT_HOST,
      },
    }
  );

  if (!server.pid) {
    logError('Failed to spawn server process');
    process.exit(1);
  }

  savePid(server.pid);
  server.unref();

  server.on('error', (error) => {
    logError('Server process error', error);
    removePid();
  });

  log(`Server process spawned (PID: ${server.pid})`);
  log('Waiting for server to become ready...');

  waitForServer().then((ready) => {
    if (ready) {
      log('✓ Gova dev server is up and running');
    } else {
      logError('Server may have failed to start — check logs/dev-server.log');
    }
  }).catch((err) => logError('Health check failed', err));
}

function stopServer(): void {
  const pid = getServerPid();
  if (!pid) {
    log('Server is not running');
    return;
  }

  log(`Stopping server (PID: ${pid})...`);

  try {
    if (process.platform === 'win32') {
      // On Windows, kill the process tree to avoid orphaned Next.js workers
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'pipe' });
    } else {
      process.kill(-pid, 'SIGTERM');
    }
    removePid();
    log('✓ Server stopped successfully');
  } catch (error) {
    logError('Failed to stop server gracefully — forcing kill', error);
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' });
      } else {
        process.kill(pid, 'SIGKILL');
      }
      removePid();
      log('✓ Server force-killed');
    } catch (killError) {
      logError('Force kill also failed', killError);
    }
  }
}

function restartServer(): void {
  log('Restarting Gova development server...');
  stopServer();
  setTimeout(() => startServer(), 1500);
}

function clearCache(): void {
  const pid = getServerPid();
  if (pid) {
    log('Stopping server before clearing cache...');
    stopServer();
    // Wait for process to fully stop before deleting cache
    setTimeout(() => performCacheClear(), 2000);
  } else {
    performCacheClear();
  }
}

function performCacheClear(): void {
  const targets = [
    path.join(ROOT_DIR, '.next'),
    path.join(ROOT_DIR, '.swc'),
    path.join(ROOT_DIR, 'tsconfig.tsbuildinfo'),
  ];

  let cleared = false;
  for (const target of targets) {
    if (fs.existsSync(target)) {
      try {
        fs.rmSync(target, { recursive: true, force: true });
        log(`✓ Cleared: ${path.basename(target)}`);
        cleared = true;
      } catch (error) {
        logError(`Failed to clear ${target}`, error);
      }
    }
  }

  if (!cleared) {
    log('No cache to clear');
  } else {
    log('✓ Cache cleared successfully — run "dev" to rebuild');
  }
}

function showStatus(): void {
  const pid = getServerPid();

  if (pid) {
    log(`Status: RUNNING (PID: ${pid})`);
    log(`URL:    http://${NEXT_HOST}:${NEXT_PORT}`);
    log(`Logs:   ${LOG_FILE}`);
  } else {
    log('Status: STOPPED');
    log(`Run "npm run server:start" to start the development server`);
  }
}

function showLogs(): void {
  if (!fs.existsSync(LOG_FILE)) {
    log('No log file found — server has not been started yet');
    return;
  }

  try {
    const content = fs.readFileSync(LOG_FILE, 'utf-8');
    // Show last 50 lines
    const lines = content.split('\n').filter(Boolean);
    const tail = lines.slice(-50).join('\n');
    console.log('\n=== Gova Dev Server Logs (last 50 lines) ===\n');
    console.log(tail);
    console.log('\n===========================================');
  } catch (error) {
    logError('Failed to read log file', error);
  }
}

// ─── CLI Dispatch ─────────────────────────────────────────────────────────────
const command = process.argv[2];

switch (command) {
  case 'start':
    startServer();
    break;
  case 'stop':
    stopServer();
    break;
  case 'restart':
    restartServer();
    break;
  case 'clear-cache':
    clearCache();
    break;
  case 'status':
    showStatus();
    break;
  case 'logs':
    showLogs();
    break;
  default:
    console.log(`
Gova Development Server Manager
────────────────────────────────
Usage: npm run server <command>

Commands:
  start        Start the development server (detached, with health check)
  stop         Stop the running server (Windows process tree kill)
  restart      Stop + start the server
  clear-cache  Clear .next, .swc, and tsbuildinfo caches
  status       Show server status (PID + URL)
  logs         Tail the last 50 lines of the server log

Server URL:  http://${NEXT_HOST}:${NEXT_PORT}
Log file:    ${LOG_FILE}
`);
}
