/**
 * UI-only environment. Deliberately a SEPARATE MODULE from
 * api-env.config.ts (not just a separate export in a shared file) —
 * importing this file must never execute ApiEnvSchema validation. This
 * mirrors api-env.config.ts's isolation for the same reason: each
 * suite's schema should only ever be evaluated when that suite's env
 * is actually imported.
 *
 * Only import `uiEnv` from UI-specific code (playwright.ui.config.ts,
 * auth setup, UI fixtures, etc.) — never from API code.
 */
import { z } from 'zod';
import { loadEnvFiles } from './env-loader.util';
import { BaseEnvSchema } from './base-env.schema';
import { parseOrThrow } from './parse-env.util';

loadEnvFiles();

/** UI-only fields layered on top of the base — browser + auth concerns. */
const UiEnvSchema = BaseEnvSchema.extend({
  BASE_URL: z.string().url(),
  HEADLESS: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),
  USERNAME: z.string().min(1, 'USERNAME is required for auth setup'),
  PASSWORD: z.string().min(1, 'PASSWORD is required for auth setup'),
});

export const uiEnv = parseOrThrow(UiEnvSchema, 'UI');
export type UiEnv = typeof uiEnv;
