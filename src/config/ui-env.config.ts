/**
 * UI-only environment. Fully self-contained on purpose — does NOT
 * import anything from api-env.config.ts, and vice versa. See the
 * comment in api-env.config.ts for why: each suite's env must be
 * validated independently, or importing one can crash on the other
 * suite's required fields being unset.
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

const UiEnvSchema = z.object({
  ENV: z.string().default('qa'),
  BASE_URL: z.string().url(),
  HEADLESS: z.string().default('true').transform((v) => v === 'true'),
  DEFAULT_TIMEOUT_MS: z.string().default('120000').transform((v) => Number(v)),
  CI: z.string().optional().transform((v) => v === 'true'),
  USERNAME: z.string().min(1, 'USERNAME is required for auth setup'),
  PASSWORD: z.string().min(1, 'PASSWORD is required for auth setup'),
});

const parsed = UiEnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid UI environment configuration:\n', parsed.error.flatten().fieldErrors);
  throw new Error('UI environment validation failed. Check your .env file.');
}

export const uiEnv = parsed.data;
export type UiEnv = typeof uiEnv;
