/**
 * Data Provider — ONE generic utility for ALL test data files.
 *
 * The problem this solves:
 *   "If we have 100 CSV files, no org realistically writes 100 interfaces
 *    to validate them."
 *
 * The pragmatic answer: don't type every file. Type only the FIELDS a
 * given test actually cares about, inline, at the point of use. The
 * loader itself stays generic (<T>) and does structural + row-level
 * validation generically (required columns present, no empty rows),
 * instead of us hand-writing bespoke shape validation per file.
 *
 * Usage in a test (no new interface file needed):
 *
 *   type LoginRow = { username: string; password: string; expectedResult: string };
 *   const rows = readCsv<LoginRow>('login-users.csv');
 *
 * If a file's structure genuinely matters across many tests (e.g. a core
 * "Customer" domain object used in 20 specs), THEN it earns a shared type
 * in src/types/ — that's the 1-in-100 case, not the default.
 */

import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

const TEST_DATA_ROOT = path.resolve(process.cwd(), 'test-data');

export class DataProviderError extends Error {}

function resolveDataPath(relativePath: string): string {
  const fullPath = path.resolve(TEST_DATA_ROOT, relativePath);

  // Prevent path traversal outside test-data/, and fail loudly with a
  // clear message instead of a cryptic ENOENT three layers down.
  if (!fullPath.startsWith(TEST_DATA_ROOT)) {
    throw new DataProviderError(`Refusing to read outside test-data/: ${relativePath}`);
  }
  if (!fs.existsSync(fullPath)) {
    throw new DataProviderError(`Test data file not found: ${relativePath} (looked in ${TEST_DATA_ROOT})`);
  }
  return fullPath;
}

export interface ReadCsvOptions {
  /** Columns that MUST exist in the header row. Fails fast if missing. */
  requiredColumns?: string[];
  /** Skip rows where every cell is empty (default: true). */
  skipEmptyRows?: boolean;
}

/**
 * Reads any CSV file in test-data/ into an array of typed rows.
 * Generic <T> — caller decides the shape, no per-file interface required.
 */
export function readCsv<T = Record<string, string>>(
  relativePath: string,
  options: ReadCsvOptions = {}
): T[] {
  const { requiredColumns = [], skipEmptyRows = true } = options;
  const fullPath = resolveDataPath(relativePath);
  const content = fs.readFileSync(fullPath, 'utf-8');

  const records = parse(content, {
    columns: true,
    skip_empty_lines: skipEmptyRows,
    trim: true,
  }) as Record<string, string>[];

  if (requiredColumns.length && records.length > 0) {
    const actualColumns = Object.keys(records[0]);
    const missing = requiredColumns.filter((c) => !actualColumns.includes(c));
    if (missing.length) {
      throw new DataProviderError(
        `${relativePath} is missing required column(s): ${missing.join(', ')}`
      );
    }
  }

  return records as unknown as T[];
}

/** Reads any JSON file in test-data/. Generic <T> for the same reason as readCsv. */
export function readJson<T = unknown>(relativePath: string): T {
  const fullPath = resolveDataPath(relativePath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  try {
    return JSON.parse(content) as T;
  } catch (err) {
    throw new DataProviderError(`Invalid JSON in ${relativePath}: ${(err as Error).message}`);
  }
}

/**
 * Filters CSV rows down to a named "scenario" / tag column, so one CSV
 * can serve smoke, regression, and negative-test suites without splitting
 * into more files.
 *
 * e.g. readCsvByTag<LoginRow>('login-users.csv', 'smoke', 'suite')
 */
export function readCsvByTag<T = Record<string, string>>(
  relativePath: string,
  tagValue: string,
  tagColumn = 'tags'
): T[] {
  const rows = readCsv<Record<string, string>>(relativePath);
  return rows.filter((row) =>
    (row[tagColumn] ?? '')
      .split('|')
      .map((t) => t.trim())
      .includes(tagValue)
  ) as unknown as T[];
}
