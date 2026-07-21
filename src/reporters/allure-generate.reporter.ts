import type { Reporter } from '@playwright/test/reporter';
import { execSync } from 'node:child_process';

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
 */
export default class AllureGenerateReporter implements Reporter {
  constructor(private readonly options: AllureGenerateReporterOptions) {}

  onEnd(): void {
    try {
      execSync(
        `npx allure generate ${this.options.resultsDir} --clean -o ${this.options.outputDir}`,
        { stdio: 'inherit' }
      );
    } catch (error) {
      // Don't fail the whole run just because report generation had an
      // issue (e.g. allure-commandline not installed yet) — surface it
      // clearly and move on.
      console.error('⚠️  Failed to generate Allure report:', (error as Error).message);
    }
  }
}
