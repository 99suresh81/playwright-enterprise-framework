import { z } from 'zod';

export function parseOrThrow<T>(schema: z.ZodType<T, z.ZodTypeDef, any>, label: string): T {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    // Fail fast, at process start — not 20 minutes into a CI run.
    console.error(`❌ Invalid ${label} environment configuration:\n`, parsed.error.flatten().fieldErrors);
    throw new Error(`${label} environment validation failed. Check your .env file.`);
  }
  return parsed.data;
}
