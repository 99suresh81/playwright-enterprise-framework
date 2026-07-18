import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { env } from '../config/env.config';
import { logger } from '../utils/logger.util';

type Fixtures = {
  loginPage: LoginPage;
};

/**
 * Extend Playwright's base test ONCE here. Every spec imports `test`
 * from this file instead of '@playwright/test' directly, so new page
 * objects/fixtures are added in one place, not copy-pasted per spec.
 */
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

test.beforeEach(async ({}, testInfo) => {
  logger.info(`Starting test: ${testInfo.title}`, { env: env.ENV });
});

export { expect } from '@playwright/test';
