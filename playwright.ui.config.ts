import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env.config';

export default defineConfig({
  testDir: './tests',
  timeout: env.DEFAULT_TIMEOUT_MS,
  fullyParallel: true,
  forbidOnly: !!env.CI,
  retries: env.CI ? 2 : 0,
  workers: env.CI ? 4 : undefined,

  reporter: env.CI
    ? [
        ['html', { open: 'never' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['github'],
        ['allure-playwright', { resultsDir: 'allure-results' }],
        ['./src/reporters/allure-generate.reporter.ts', { resultsDir: 'allure-results', outputDir: 'allure-report' }],
      ]
    : [
        ['html', { open: 'never' }],
        ['list'],
        ['allure-playwright', { resultsDir: 'allure-results' }],
        ['./src/reporters/allure-generate.reporter.ts', { resultsDir: 'allure-results', outputDir: 'allure-report' }],
      ],

  use: {
    baseURL: env.BASE_URL,
    headless: env.HEADLESS,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  projects: [
    // Runs auth.setup.ts once, saves logged-in state for every other project.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'smoke',
      grep: /@smoke/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'regression',
      grep: /@regression/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
