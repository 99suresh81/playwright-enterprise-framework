/**
 * Deliberately NOT winston/pino. Playwright's HTML report + trace viewer
 * already give you step-level detail; a heavy logging stack is overkill
 * for most suites. This gives structured, timestamped, leveled console
 * output that's greppable in CI logs — upgrade to a real logger only if
 * you actually ship logs to a central system (ELK/Datadog/etc).
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

function write(level: LogLevel, message: string, meta?: unknown): void {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${message}`;
  if (meta !== undefined) {
    // eslint-disable-next-line no-console
    console.log(line, JSON.stringify(meta));
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

export const logger = {
  info: (message: string, meta?: unknown) => write('INFO', message, meta),
  warn: (message: string, meta?: unknown) => write('WARN', message, meta),
  error: (message: string, meta?: unknown) => write('ERROR', message, meta),
  debug: (message: string, meta?: unknown) => {
    if (process.env.DEBUG === 'true') write('DEBUG', message, meta);
  },
};
