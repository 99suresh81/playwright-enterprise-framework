import type { Reporter } from '@playwright/test/reporter';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

interface AllureGenerateReporterOptions {
  resultsDir: string;
  outputDir: string;
}

/**
 * Generates the Allure HTML report automatically once a run finishes —
 * pass or fail — via Playwright's onEnd() hook. Replaces the earlier
 * approach of a separate `scripts/run-tests.js` wrapper: Playwright
 * guarantees onEnd() runs regardless of test outcome, so no external
 * process-wrapping is needed, and this same reporter works for both the
 * UI and API configs just by passing a different resultsDir/outputDir.
 *
 * Note on ordering: Playwright calls onEnd() on each configured reporter
 * sequentially, awaiting each before moving to the next, in the order
 * they're listed in the config. Both configs list 'allure-playwright'
 * BEFORE this reporter, so allure-playwright's result files are fully
 * flushed to disk by the time this reporter's onEnd() runs. The check
 * below is a defensive guard in case that ordering is ever changed, or
 * a run produces zero results — not a workaround for a live race today.
 */
export default class AllureGenerateReporter implements Reporter {
  constructor(private readonly options: AllureGenerateReporterOptions) {}

  onEnd(): void {
    try {
      const hasResults =
        fs.existsSync(this.options.resultsDir) && fs.readdirSync(this.options.resultsDir).length > 0;

      if (!hasResults) {
        console.warn(
          `⚠️  No Allure result files found in ${this.options.resultsDir} — skipping report generation. ` +
            `Check that 'allure-playwright' is registered before this reporter in the config.`
        );
        return;
      }

      execSync(`npx allure generate ${this.options.resultsDir} --clean -o ${this.options.outputDir}`, {
        stdio: 'inherit',
      });
    } catch (error) {
      // Don't fail the whole run just because report generation had an
      // issue (e.g. allure-commandline not installed yet) — surface it
      // clearly and move on.
      console.error('⚠️  Failed to generate Allure report:', (error as Error).message);
    }
  }
}
