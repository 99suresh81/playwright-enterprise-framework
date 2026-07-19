# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.setup.ts >> authenticate
- Location: tests\auth.setup.ts:14:6

# Error details

```
Error: page.goto: net::ERR_NAME_NOT_RESOLVED at https://qa.example.com/login
Call log:
  - navigating to "https://qa.example.com/login", waiting until "load"

```

# Test source

```ts
  1  | import { Page, Locator, expect } from '@playwright/test';
  2  | import { logger } from '../utils/logger.util';
  3  | 
  4  | /**
  5  |  * Base page: only what's genuinely shared across every page.
  6  |  * Resist the urge to add "just in case" helper methods here —
  7  |  * page-specific behaviour belongs on the page subclass, not here.
  8  |  */
  9  | export abstract class BasePage {
  10 |   protected constructor(protected readonly page: Page) {}
  11 | 
  12 |   async goto(path = '/'): Promise<void> {
  13 |     logger.info(`Navigating to ${path}`);
> 14 |     await this.page.goto(path);
     |                     ^ Error: page.goto: net::ERR_NAME_NOT_RESOLVED at https://qa.example.com/login
  15 |   }
  16 | 
  17 |   async clickAndWait(locator: Locator): Promise<void> {
  18 |     await locator.click();
  19 |     await this.page.waitForLoadState('networkidle');
  20 |   }
  21 | 
  22 |   async expectVisible(locator: Locator): Promise<void> {
  23 |     await expect(locator).toBeVisible();
  24 |   }
  25 | 
  26 |   async getTitle(): Promise<string> {
  27 |     return this.page.title();
  28 |   }
  29 | }
  30 | 
```