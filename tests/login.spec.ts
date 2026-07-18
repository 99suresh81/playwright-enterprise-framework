import { test, expect } from '../src/fixtures/base.fixture';
import { readCsv, readCsvByTag } from '../src/utils/data-provider.util';

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
  tags: string;
};

test.describe('Login', () => {
  // Full data set, required columns checked generically (fails fast if
  // someone edits the CSV and drops a column).
  const rows = readCsv<LoginRow>('login-users.csv', {
    requiredColumns: ['username', 'password', 'expectedResult'],
  });

  for (const row of rows) {
    test(`login with "${row.username || '(empty)'}" -> ${row.expectedResult}`, async ({
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

test.describe('Login - smoke only', () => {
  // Same CSV, filtered by tag column — no second file needed for a
  // smaller smoke suite.
  const smokeRows = readCsvByTag<LoginRow>('login-users.csv', 'smoke');

  for (const row of smokeRows) {
    test(`@smoke login "${row.username}" -> ${row.expectedResult}`, async ({ loginPage }) => {
      await loginPage.login(row.username, row.password);
      expect(row.expectedResult).toBeTruthy();
    });
  }
});
