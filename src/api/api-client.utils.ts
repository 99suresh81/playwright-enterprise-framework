import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { logger } from '../utils/logger.util';

/**
 * Thin wrapper around Playwright's built-in APIRequestContext.
 * Not a reimplementation — baseURL/headers/auth come from
 * playwright.api.config.ts's `use` block, same pattern as the UI suite.
 * This just adds consistent logging and a shared status-assertion helper
 * so every spec doesn't repeat that boilerplate.
 */
export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async get(url: string, options?: Parameters<APIRequestContext['get']>[1]): Promise<APIResponse> {
    logger.info(`GET ${url}`);
    return this.request.get(url, options);
  }

  async post(url: string, options?: Parameters<APIRequestContext['post']>[1]): Promise<APIResponse> {
    logger.info(`POST ${url}`);
    return this.request.post(url, options);
  }

  async put(url: string, options?: Parameters<APIRequestContext['put']>[1]): Promise<APIResponse> {
    logger.info(`PUT ${url}`);
    return this.request.put(url, options);
  }

  async delete(url: string, options?: Parameters<APIRequestContext['delete']>[1]): Promise<APIResponse> {
    logger.info(`DELETE ${url}`);
    return this.request.delete(url, options);
  }

  /** Fails with the response body in the error message, not just a bare status mismatch. */
  async expectStatus(response: APIResponse, expectedStatus: number): Promise<void> {
    if (response.status() !== expectedStatus) {
      const body = await response.text().catch(() => '<unreadable body>');
      expect(response.status(), `Unexpected status. Response body: ${body}`).toBe(expectedStatus);
    }
  }
}
