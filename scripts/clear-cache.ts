import fs from 'fs';
import path from 'path';

const cacheDir = path.join(process.cwd(), '.next');

if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log('Cache cleared successfully');
} else {
  console.log('No cache to clear');
}
