import { test as setup } from '../../src/fixtures/base.ui.fixture';
import { env } from '../../src/config/env.config';

const STORAGE_STATE_PATH = 'playwright/.auth/user.json';

/**
 * Runs once before the real test suite (see playwright.config.ts
 * `setup` project + `dependencies`). Every other test starts already
 * logged in, instead of repeating login steps in every spec.
 *
 * Credentials come from env (USERNAME/PASSWORD), not a checked-in file —
 * in real CI these are injected via a secrets manager, not .env.
 */
setup('authenticate', async ({ loginPage, page }) => {
  await loginPage.login(env.USERNAME, env.PASSWORD);
  await page.waitForURL('**/dashboard');

  await page.context().storageState({ path: STORAGE_STATE_PATH });
});
