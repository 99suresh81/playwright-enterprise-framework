import { Page, Locator, expect } from '@playwright/test';
import { logger } from '../utils/logger.util';

/**
 * Base page: only what's genuinely shared across every page.
 * Resist the urge to add "just in case" helper methods here —
 * page-specific behaviour belongs on the page subclass, not here.
 */
export abstract class BasePage {
  protected constructor(protected readonly page: Page) {}

  async goto(path = '/'): Promise<void> {
    logger.info(`Navigating to ${path}`);
    await this.page.goto(path);
  }

  async clickAndWait(locator: Locator): Promise<void> {
    await locator.click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /** Exposes the underlying Page for assertions in specs (e.g. toHaveURL) without bracket-notation access hacks. */
  get currentPage(): Page {
    return this.page;
  }
}
