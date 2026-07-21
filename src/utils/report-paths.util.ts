/**
 * Report folder/file naming strategy:
 * - Local runs: fixed names (no suffix) so each run simply overwrites the
 *   last — no folder buildup to clean up manually.
 * - CI/pipeline runs: a timestamp suffix, so each pipeline run's reports
 *   are distinct and don't clobber a previous run's artifacts before
 *   upload (useful if multiple runs happen close together, or reports
 *   are ever collected from the same workspace before upload).
 *
 * Used by both playwright.config.ts and playwright.api.config.ts so the
 * naming rule stays in one place instead of being duplicated per config.
 */
export function reportSuffix(isCI: boolean): string {
  if (!isCI) return '';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `-${timestamp}`;
}
