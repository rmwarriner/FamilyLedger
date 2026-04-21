import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: 1,
  fullyParallel: false,
  use: {
    headless: true,
    baseURL: 'http://127.0.0.1:1420'
  },
  webServer: {
    command: 'pnpm --filter @familyledger/desktop dev --host 127.0.0.1 --port 1420',
    url: 'http://127.0.0.1:1420',
    reuseExistingServer: true,
    timeout: 120_000
  }
});
