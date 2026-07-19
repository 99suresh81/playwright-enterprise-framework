/**
 * Single source of environment truth.
 *
 * Pragmatic choice: ONE .env file + an ENV var to pick environment-specific
 * overrides (.env.qa, .env.staging, ...), not a separate config *class*
 * per environment. Validated once with zod so a missing/malformed var
 * fails at startup with a readable message, not mid-test as `undefined`.
 */
import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';
import path from 'node:path';

const envName = process.env.ENV ?? 'qa';

// Base .env first, then an environment-specific file that can override it.
loadDotenv({ path: path.resolve(process.cwd(), '.env') });
loadDotenv({ path: path.resolve(process.cwd(), `.env.${envName}`), override: true });

const EnvSchema = z.object({
  ENV: z.string().default('qa'),
  BASE_URL: z.string().url(),
  API_BASE_URL: z.string().url().optional(),
  HEADLESS: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),
  DEFAULT_TIMEOUT_MS: z
    .string()
    .default('120000')
    .transform((v) => Number(v)),
  CI: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  USERNAME: z.string().min(1, 'USERNAME is required for auth setup'),
  PASSWORD: z.string().min(1, 'PASSWORD is required for auth setup'),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast, at process start — not 20 minutes into a CI run.
  console.error('❌ Invalid environment configuration:\n', parsed.error.flatten().fieldErrors);
  throw new Error('Environment validation failed. Check your .env file.');
}
export const env = parsed.data;
export type Env = typeof env;
