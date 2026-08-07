import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration file.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/reporters */
  reporter: 'list',
  
  /* Path to the global setup script */
  globalSetup: require.resolve('./tests/global-setup.ts'),

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3001',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npx next dev -p 3001',
    port: 3001,
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: 'file:./prisma/test.db',
      AUTH_SECRET: 'supersecret123',
      PORT: '3001',
    },
  },
});
