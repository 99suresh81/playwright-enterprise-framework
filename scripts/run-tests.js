/**
 * Runs Playwright tests, then ALWAYS generates the Allure report
 * (pass or fail) — npm's `posttest` hook only fires on success, which
 * is useless since the report matters most on failure.
 * Exits with the original Playwright exit code so CI still fails properly.
 *
 * Environment selection is handled by cross-env in package.json scripts
 * (e.g. "test:local": "cross-env ENV=local node scripts/run-tests.js"),
 * not by this script — this just runs tests + reporting.
 */
const { spawnSync } = require('node:child_process');

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: true });
  return result.status ?? 1;
}

const testExitCode = run('npx', ['playwright', 'test', ...process.argv.slice(2)]);
run('npx', ['allure', 'generate', 'allure-results', '--clean', '-o', 'allure-report']);

process.exit(testExitCode);
