import { test as base } from '@playwright/test';
import { ApiClient } from '../api/api-client.util';

type ApiFixtures = {
  apiClient: ApiClient;
};

/**
 * Same pattern as base.ui.fixture.ts for UI — extend ONCE here, every API
 * spec imports `test`/`expect` from this file instead of '@playwright/test'.
 * Uses Playwright's built-in `request` fixture (respects baseURL/headers
 * from playwright.api.config.ts) rather than creating a second context.
 */
export const test = base.extend<ApiFixtures>({
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },
});

export { expect } from '@playwright/test';
