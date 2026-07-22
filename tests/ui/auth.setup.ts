import { test as setup } from '../../src/fixtures/base.ui.fixture';
import { env } from '../../src/config/env.config';

const STORAGE_STATE_PATH = 'playwright/.auth/user.json';

if (!env.USERNAME || !env.PASSWORD) {
  throw new Error(
    'USERNAME and PASSWORD are required to run the UI suite (used by auth.setup.ts). ' +
      'Set them in .env.local — see .env.local.example.'
  );
}

// Narrowed to `string` here (not string | undefined) so the values below
// stay type-safe inside the closure without a non-null assertion.
const username = env.USERNAME;
const password = env.PASSWORD;

/**
 * Runs once before the real test suite (see playwright.ui.config.ts
 * `setup` project + `dependencies`). Every other test starts already
 * logged in, instead of repeating login steps in every spec.
 *
 * Credentials come from env (USERNAME/PASSWORD), not a checked-in file —
 * in real CI these are injected via a secrets manager, not .env.
 */
setup('authenticate', async ({ loginPage, page }) => {
  await loginPage.login(username, password);
  await page.waitForURL('**/dashboard');

  await page.context().storageState({ path: STORAGE_STATE_PATH });
});
