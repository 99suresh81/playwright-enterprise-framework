import { z } from 'zod';

/** Fields every suite needs, regardless of UI vs API. */
export const BaseEnvSchema = z.object({
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
