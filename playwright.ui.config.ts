import { defineConfig, devices } from '@playwright/test';
import { uiEnv } from './src/config/ui-env.config';
import { reportSuffix } from './src/utils/report-paths.util';
const suffix = reportSuffix(!!uiEnv.CI);
export default defineConfig({
  testDir: './tests/ui',
  timeout: uiEnv.DEFAULT_TIMEOUT_MS,
  fullyParallel: true,
  forbidOnly: !!uiEnv.CI,
  retries: uiEnv.CI ? 2 : 0,
  workers: uiEnv.CI ? 4 : undefined,
  reporter: uiEnv.CI
    ? [
        ['html', { open: 'never', outputFolder: `playwright-report${suffix}` }],
        ['junit', { outputFile: `test-results/junit${suffix}.xml` }],
        ['github'],
        ['allure-playwright', { resultsDir: `allure-results${suffix}` }],
        [
          './src/reporters/allure-generate.reporter.ts',
          { resultsDir: `allure-results${suffix}`, outputDir: `allure-report${suffix}` },
        ],
      ]
    : [
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['list'],
        ['allure-playwright', { resultsDir: 'allure-results' }],
        [
          './src/reporters/allure-generate.reporter.ts',
          { resultsDir: 'allure-results', outputDir: 'allure-report' },
        ],
      ],
  use: {
    baseURL: uiEnv.BASE_URL,
    headless: uiEnv.HEADLESS,
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
