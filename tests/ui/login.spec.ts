import { test, expect } from '../../src/fixtures/base.ui.fixture';
import { readCsv } from '../../src/utils/data-provider.util';

/**
 * The shape below is declared INLINE, at the point of use — this is the
 * only "typing" this file needs. If tomorrow there are 99 more CSVs like
 * this, each spec declares its own small inline type the same way.
 * Nobody writes (or maintains) 100 interface files.
 */
type LoginRow = {
  username: string;
  password: string;
  expectedResult: 'success' | 'account_locked' | 'invalid_credentials' | 'username_required';
  tags: string; // pipe-separated, e.g. "smoke|regression"
};

test.describe('Login', () => {
  // Full data set, required columns checked generically (fails fast if
  // someone edits the CSV and drops a column).
  const rows = readCsv<LoginRow>('ui/login-users.csv', {
    requiredColumns: ['username', 'password', 'expectedResult'],
  });

  for (const row of rows) {
    // Tags from the CSV become @tag markers in the title, so Playwright's
    // built-in `grep` (used via the smoke/regression projects in
    // playwright.ui.config.ts) can filter this ONE test list — no separate
    // loop or second describe block needed per suite.
    const tagLabels = row.tags
      .split('|')
      .map((t) => `@${t.trim()}`)
      .join(' ');

    test(`${tagLabels} login "${row.username || '(empty)'}" -> ${row.expectedResult}`, async ({
      loginPage,
    }) => {
      await loginPage.login(row.username, row.password);

      if (row.expectedResult === 'success') {
        await expect(loginPage['page']).toHaveURL(/dashboard/);
      } else {
        const errorText = await loginPage.getErrorText();
        expect(errorText).toBeTruthy();
      }
    });
  }
});
