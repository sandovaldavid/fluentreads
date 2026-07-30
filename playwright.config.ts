import { defineConfig, devices } from '@playwright/test';

/**
 * E2E smoke coverage for the core conversion path (catalog -> detail ->
 * cart -> WhatsApp checkout). Runs against the Astro dev server, which
 * serves the same routes/content as the static build without requiring a
 * prior `astro build`.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    // `astro dev` auto-detects AI coding agents and backgrounds itself
    // (see https://docs.astro.build/en/guides/build-with-ai/#background-mode),
    // which orphans the process Playwright is trying to manage. Force it to
    // stay attached so Playwright can track readiness and shut it down.
    env: { ASTRO_DEV_BACKGROUND: '0' },
  },
});
