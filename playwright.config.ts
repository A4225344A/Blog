import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';
import { normalizeBase } from './src/config/hosting';
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve('.playwright');
const base = normalizeBase(process.env.SITE_BASE);
export default defineConfig({
  testDir: './tests/browser', workers: 1,
  use: { baseURL: `http://127.0.0.1:4322${base}`, headless: true },
  // Playwright owns the process lifecycle; Astro's agent background mode must not detach it.
  webServer: { command: 'node node_modules/astro/bin/astro.mjs preview --host 127.0.0.1 --port 4322', env: { ASTRO_PREVIEW_BACKGROUND: '0' }, url: `http://127.0.0.1:4322${base}`, reuseExistingServer: false },
});
