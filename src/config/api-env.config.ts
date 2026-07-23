/**
 * API-only environment. Fully self-contained on purpose — does NOT
 * import anything from ui-env.config.ts, and vice versa. Each file loads
 * its own .env files and validates only its own schema, so importing
 * `apiEnv` can never fail because of a UI-only field (BASE_URL,
 * USERNAME, PASSWORD) being unset, and importing `uiEnv` can never fail
 * because of an API-only field being unset.
 *
 * A few lines (env-file loading, DEFAULT_TIMEOUT_MS/CI fields) are
 * duplicated in ui-env.config.ts rather than factored into a shared
 * file — small enough that sharing it cost more (extra files to open)
 * than it saved.
 */
import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';
import path from 'node:path';

const envName = process.env.ENV ?? 'qa';
loadDotenv({ path: path.resolve(process.cwd(), '.env') });

const envSpecificPath = path.resolve(process.cwd(), `.env.${envName}`);
const envSpecificResult = loadDotenv({ path: envSpecificPath, override: true });

if (envSpecificResult.error) {
  const err = envSpecificResult.error as NodeJS.ErrnoException;
  if (err.code === 'ENOENT') {
    console.warn(`⚠️  .env.${envName} not found at ${envSpecificPath} — continuing with .env and process.env/CI secrets only.`);
  } else {
    console.error(`❌ Failed to parse .env.${envName}:`, err.message);
    throw new Error(`Could not load .env.${envName}. Check the file for syntax errors.`);
  }
}

const ApiEnvSchema = z.object({
  ENV: z.string().default('qa'),
  API_BASE_URL: z.string().url(),
  DEFAULT_TIMEOUT_MS: z.string().default('120000').transform((v) => Number(v)),
  CI: z.string().optional().transform((v) => v === 'true'),
});

const parsed = ApiEnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid API environment configuration:\n', parsed.error.flatten().fieldErrors);
  throw new Error('API environment validation failed. Check your .env file.');
}

export const apiEnv = parsed.data;
export type ApiEnv = typeof apiEnv;
