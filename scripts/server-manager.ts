import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const PID_FILE = path.join(process.cwd(), '.server.pid');

function getServerPid(): number | null {
  if (fs.existsSync(PID_FILE)) {
    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf-8').trim());
    if (!isNaN(pid)) {
      try {
        process.kill(pid, 0);
        return pid;
      } catch {
        // Process not running
        fs.unlinkSync(PID_FILE);
      }
    }
  }
  return null;
}

function saveServerPid(pid: number): void {
  fs.writeFileSync(PID_FILE, pid.toString());
}

function removeServerPid(): void {
  if (fs.existsSync(PID_FILE)) {
    fs.unlinkSync(PID_FILE);
  }
}

function startServer(): void {
  const existingPid = getServerPid();
  if (existingPid) {
    console.log(`Server is already running (PID: ${existingPid})`);
    return;
  }

  console.log('Starting development server...');
  
  const server = spawn('cmd', ['/c', 'start', '/b', 'npm', 'run', 'dev'], {
    stdio: 'inherit',
    shell: false,
    detached: true
  });

  saveServerPid(server.pid!);

  server.unref();

  server.on('error', (error) => {
    console.error('Failed to start server:', error);
    removeServerPid();
  });

  server.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
    removeServerPid();
  });

  console.log(`Server started (PID: ${server.pid})`);
}

function stopServer(): void {
  const pid = getServerPid();
  if (!pid) {
    console.log('Server is not running');
    return;
  }

  console.log(`Stopping server (PID: ${pid})...`);
  
  try {
    process.kill(pid, 'SIGTERM');
    removeServerPid();
    console.log('Server stopped successfully');
  } catch (error) {
    console.error('Failed to stop server:', error);
  }
}

function clearCache(): void {
  const pid = getServerPid();
  if (pid) {
    console.log('Stopping server before clearing cache...');
    stopServer();
  }

  const cacheDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log('Cache cleared successfully');
  } else {
    console.log('No cache to clear');
  }
}

function restartServer(): void {
  console.log('Restarting server...');
  stopServer();
  setTimeout(() => {
    startServer();
  }, 1000);
}

function showStatus(): void {
  const pid = getServerPid();
  if (pid) {
    console.log(`Server is running (PID: ${pid})`);
  } else {
    console.log('Server is not running');
  }
}

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
  default:
    console.log('Usage: npm run server <command>');
    console.log('Commands:');
    console.log('  start       - Start the development server');
    console.log('  stop        - Stop the development server');
    console.log('  restart     - Restart the development server');
    console.log('  clear-cache - Clear cache and stop server');
    console.log('  status      - Show server status');
    break;
}
