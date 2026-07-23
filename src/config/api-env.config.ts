
 *
 * Only import `apiEnv` from API-specific code (playwright.api.config.ts,
 * api fixtures, etc.) — never from UI code.
 */
import { loadEnvFiles } from './env-loader.util';
import { BaseEnvSchema } from './base-env.schema';
import { parseOrThrow } from './parse-env.util';

loadEnvFiles();

/**
 * Empty extension today — the API suite currently needs nothing beyond
 * API_BASE_URL/CI/DEFAULT_TIMEOUT_MS, which already live in
 * BaseEnvSchema. Kept as an explicit `.extend({})` so this is the
 * obvious place to add API-specific fields later (e.g. API_AUTH_TOKEN)
 * without touching UiEnvSchema.
 */
const ApiEnvSchema = BaseEnvSchema.extend({});

export const apiEnv = parseOrThrow(ApiEnvSchema, 'API');
export type ApiEnv = typeof apiEnv;
