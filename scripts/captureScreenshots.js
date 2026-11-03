import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const screenshotsDir = path.join(process.cwd(), 'docs', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const routes = [
  { name: 'homepage.png', url: 'http://localhost:5173/' },
  { name: 'new_cars.png', url: 'http://localhost:5173/vehicles' },
  { name: 'vehicle_details.png', url: 'http://localhost:5173/vehicles/model-h' },
  { name: 'test_drive.png', url: 'http://localhost:5173/test-drive' },
  { name: 'used_cars.png', url: 'http://localhost:5173/used-cars' },
  { name: 'crm_inbox.png', url: 'http://localhost:5173/login' },
];

console.log('[Screenshots] Starting screenshot capture...');

for (const route of routes) {
  const dest = path.join(screenshotsDir, route.name);
  const cmd = `"${chromePath}" --headless --disable-gpu --window-size=1440,900 --virtual-time-budget=2000 --screenshot="${dest}" "${route.url}"`;
  console.log(`[Screenshots] Capturing ${route.url} -> ${route.name}`);
  try {
    execSync(cmd);
    if (fs.existsSync(dest)) {
      const stats = fs.statSync(dest);
      console.log(`[Screenshots] OK: ${route.name} (${(stats.size / 1024).toFixed(1)} KB)`);
    } else {
      console.warn(`[Screenshots] Warning: ${route.name} not found after execution`);
    }
  } catch (err) {
    console.error(`[Screenshots] Failed to capture ${route.name}:`, err.message);
  }
}

console.log('[Screenshots] Done.');
