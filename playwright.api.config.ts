import { defineConfig } from '@playwright/test';
import { env } from './src/config/env.config';

if (!env.API_BASE_URL) {
  throw new Error('API_BASE_URL is required to run the API suite. Set it in your .env file.');
}

/**
 * Separate from playwright.config.ts on purpose: API tests need no
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
        ['html', { open: 'never', outputFolder: 'playwright-report-api' }],
        ['junit', { outputFile: 'test-results/junit-api.xml' }],
        ['github'],
        ['allure-playwright', { resultsDir: 'allure-results-api' }],
        ['./src/reporters/allure-generate.reporter.ts', { resultsDir: 'allure-results-api', outputDir: 'allure-report-api' }],
      ]
    : [
        ['html', { open: 'never', outputFolder: 'playwright-report-api' }],
        ['list'],
        ['allure-playwright', { resultsDir: 'allure-results-api' }],
        ['./src/reporters/allure-generate.reporter.ts', { resultsDir: 'allure-results-api', outputDir: 'allure-report-api' }],
      ],

  use: {
    baseURL: env.API_BASE_URL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  },

  // No browser needed - one logical "project" for API tests.
  projects: [{ name: 'api' }],
});
