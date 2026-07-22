/**
 * Single source of environment truth.
 *
 * Split into a base schema (shared by every suite) and a UI-only
 * extension. playwright.api.config.ts imports `env` (base fields only);
 * playwright.ui.config.ts imports `uiEnv` (base + auth fields). This
 * keeps the API suite runnable without USERNAME/PASSWORD/BASE_URL ever
 * being set — it never reads them, so it shouldn't be blocked by them.
 */
import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';
import path from 'node:path';

const envName = process.env.ENV ?? 'qa';

// Base .env first, then an environment-specific file that can override it.
loadDotenv({ path: path.resolve(process.cwd(), '.env') });

const envSpecificPath = path.resolve(process.cwd(), `.env.${envName}`);
const envSpecificResult = loadDotenv({ path: envSpecificPath, override: true });

if (envSpecificResult.error) {
  const err = envSpecificResult.error as NodeJS.ErrnoException;
  if (err.code === 'ENOENT') {
    // Not fatal — CI typically injects vars via secrets, not a file — but
    // surfaced clearly so a local run doesn't end up staring at a bare
    // ZodError with no idea the actual cause was a missing file.
    console.warn(
      `⚠️  .env.${envName} not found at ${envSpecificPath} — continuing with .env and process.env/CI secrets only.`
    );
  } else {
    console.error(`❌ Failed to parse .env.${envName}:`, err.message);
    throw new Error(`Could not load .env.${envName}. Check the file for syntax errors.`);
  }
}

/** Fields every suite needs, regardless of UI vs API. */
const BaseEnvSchema = z.object({
  ENV: z.string().default('qa'),
  API_BASE_URL: z.string().url().optional(),
  DEFAULT_TIMEOUT_MS: z
    .string()
    .default('120000')
    .transform((v) => Number(v)),
  CI: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

/** UI-only fields layered on top — browser + auth concerns. */
const UiEnvSchema = BaseEnvSchema.extend({
  BASE_URL: z.string().url(),
  HEADLESS: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),
  USERNAME: z.string().min(1, 'USERNAME is required for auth setup'),
  PASSWORD: z.string().min(1, 'PASSWORD is required for auth setup'),
});

function parseOrThrow<T>(schema: z.ZodType<T>, label: string): T {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    // Fail fast, at process start — not 20 minutes into a CI run.
    console.error(`❌ Invalid ${label} environment configuration:\n`, parsed.error.flatten().fieldErrors);
    throw new Error(`${label} environment validation failed. Check your .env file.`);
  }
  return parsed.data;
}

/** Base env — safe to import from ANY config, including API-only runs. */
export const env = parseOrThrow(BaseEnvSchema, 'base');
export type Env = typeof env;

/** UI env — only import this from UI-specific code (playwright.ui.config.ts, auth setup, etc.). */
export const uiEnv = parseOrThrow(UiEnvSchema, 'UI');
export type UiEnv = typeof uiEnv;
