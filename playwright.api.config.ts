import { defineConfig } from '@playwright/test';
import { env } from './src/config/env.config';
import { reportSuffix } from './src/utils/report-paths.util';
if (!env.API_BASE_URL) {
  throw new Error('API_BASE_URL is required to run the API suite. Set it in your .env file.');
}
const suffix = reportSuffix(!!env.CI);
/**
 * Separate from playwright.ui.config.ts on purpose: API tests need no
 * browser, no devices, no storageState — running them through the UI
 * config would drag in irrelevant setup and slow CI for no benefit.
 * Shares env.config.ts, logger, and data-provider with the UI suite.
 */
export default defineConfig({
  testDir: './tests/api',
  timeout: env.DEFAULT_TIMEOUT_MS,
  fullyParallel: true,
  forbidOnly: !!env.CI,
  retries: env.CI ? 2 : 0,
  workers: env.CI ? 4 : undefined,
  reporter: env.CI
    ? [
        ['html', { open: 'never', outputFolder: `playwright-report-api${suffix}` }],
        ['junit', { outputFile: `test-results/junit-api${suffix}.xml` }],
        ['github'],
        ['allure-playwright', { resultsDir: `allure-results-api${suffix}` }],
        [
          './src/reporters/allure-generate.reporter.ts',
          { resultsDir: `allure-results-api${suffix}`, outputDir: `allure-report-api${suffix}` },
        ],
      ]
    : [
        ['html', { open: 'never', outputFolder: 'playwright-report-api' }],
        ['list'],
        ['allure-playwright', { resultsDir: 'allure-results-api' }],
        [
          './src/reporters/allure-generate.reporter.ts',
          { resultsDir: 'allure-results-api', outputDir: 'allure-report-api' },
        ],
      ],
  use: {
    baseURL: env.API_BASE_URL,
    // Content-Type is intentionally NOT forced here. Playwright already
    // sets the correct Content-Type per-request automatically: JSON when
    // you pass `data: <object>`, multipart boundaries when you pass
    // `multipart:`, and form-encoding when you pass `form:`. A static
    // `application/json` here would silently override all of those and
    // break any test doing a file upload or form-encoded POST.
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
  },
  // No browser needed - one logical "project" for API tests.
  projects: [{ name: 'api' }],
});
