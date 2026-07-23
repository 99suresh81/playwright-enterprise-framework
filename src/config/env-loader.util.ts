import { config as loadDotenv } from 'dotenv';
import path from 'node:path';

/**
 * Loads .env then .env.<ENV> (override). Pure side effect on process.env —
 * no schema, no validation. Kept separate from ui-env.config.ts /
 * api-env.config.ts so loading is shared without either suite's schema
 * being pulled in by the other (see comment in those files for why that
 * separation matters).
 */
export function loadEnvFiles(): void {
  const envName = process.env.ENV ?? 'qa';

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
}
