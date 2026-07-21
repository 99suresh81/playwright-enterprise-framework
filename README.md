# Playwright Enterprise Framework

A modern, CI-ready Playwright framework covering both UI and API testing:
typed config, reusable auth sessions, structured logging, scalable
data-driven testing, Allure reporting, and a Page Object layer — built to
stay maintainable as the suite grows into hundreds of tests, not just a
handful.

## Key capabilities

- **Environment management** — schema-validated config (`env.config.ts`),
  fails fast on missing/malformed vars instead of failing mid-run. Supports
  per-environment override files (`.env`, `.env.qa`, `.env.local`, ...).
- **Authentication reuse (UI)** — `auth.setup.ts` logs in once using
  credentials from env (`USERNAME`/`PASSWORD`), every test starts
  pre-authenticated via saved storage state.
- **Scalable data-driven testing** — a single generic loader
  (`data-provider.util.ts`: `readCsv<T>()`, `readJson<T>()`,
  `readCsvByTag<T>()`) powers every data file, UI or API. Each spec types
  only the fields it needs, inline — so the framework scales to hundreds
  of data files without hundreds of interface files to maintain.
- **Page Object Model (UI)** — `BasePage` + concrete pages, kept lean and
  extendable per feature.
- **API testing suite** — a parallel, independent suite (`playwright.api.config.ts`,
  `tests/api/`) using Playwright's built-in request context, wrapped in a
  thin `ApiClient` for consistent logging and status assertions. No
  browser overhead, runs and reports separately from UI tests.
- **Tag-based test selection** — CSV `tags` column becomes `@tag` markers
  in test titles; `smoke`/`regression` Playwright projects filter via
  `grep`, so one data file serves multiple suites.
- **Reporting** — HTML (quick local look), JUnit (CI integration), and
  Allure (richer dashboards/history) for both UI and API suites.
- **CI/CD pipeline** — GitHub Actions with two parallel jobs (`ui-tests`,
  `api-tests`): typecheck → run → upload HTML/JUnit/Allure artifacts.
- **Structured logging** — lightweight, timestamped, CI-greppable.

**Rule of thumb on typing data:** a data file earns its own shared type
in `src/types/` only if its shape is a real cross-cutting domain object
referenced by many specs (e.g. "Customer"). A one-off test data file
uses an inline type instead.

## What's deliberately *not* in here

- No custom logging framework (winston/pino) — Playwright's trace viewer
  and HTML report already give step-level detail. `logger.util.ts` is a
  small console wrapper, upgrade only if you ship logs externally.
- No per-environment config classes — one `.env` + `.env.<ENV>` override,
  validated once with zod at startup.
- No abstract "component object" layer on top of Page Objects — just
  `BasePage` + concrete pages. Add a `components/` folder only when you
  have a real repeated widget (e.g. a nav bar on every page).
- No custom test runner / BDD layer (Cucumber, etc.) — plain Playwright
  test + `test.describe` reads fine for most teams and keeps the stack
  boring and debuggable.
- No separate repo for the API suite — it shares this repo's env config,
  logger, and data provider. Split it out only if a different team owns
  API tests with a different release cadence.

## Structure

```
playwright-enterprise-framework/
├── .github/workflows/playwright.yml   # CI: parallel ui-tests + api-tests jobs
├── src/
│   ├── config/env.config.ts           # validated env, one file
│   ├── fixtures/
│   │   ├── base.fixture.ts            # UI: extend Playwright test ONCE here
│   │   └── api.fixture.ts             # API: extend Playwright test ONCE here
│   ├── api/
│   │   └── api-client.util.ts         # thin wrapper: logging + status asserts
│   ├── pages/
│   │   ├── base.page.ts
│   │   └── login.page.ts
│   └── utils/
│       ├── data-provider.util.ts      # <-- the generic CSV/JSON loader (UI + API)
│       └── logger.util.ts
├── tests/
│   ├── auth.setup.ts                  # log in once, reuse storage state
│   ├── login.spec.ts                  # UI: shows the inline-type + tag pattern
│   └── api/
│       └── users.api.spec.ts          # API: same inline-type pattern
├── test-data/
│   ├── login-users.csv
│   └── api/
│       └── create-user.json
├── scripts/
│   └── run-tests.js                   # UI: runs tests, always generates Allure after
├── .env
├── playwright.config.ts               # UI config (browsers, storageState, smoke/regression projects)
├── playwright.api.config.ts           # API config (no browser, own reporters)
└── package.json
```

## Getting started

```bash
npm install
npm run install:browsers
```

### UI tests

```bash
npm run test:local          # runs UI suite against .env.local, auto-generates Allure report after
npm run test:smoke          # smoke-tagged tests only (grep: /@smoke/)
npm run test:regression     # regression-tagged tests only
npm run test:local -- tests/login.spec.ts   # single file
```

### API tests

```bash
npm run test:api:local
npm run allure:generate:api   # Allure isn't auto-generated for API yet — run manually
```

### Reports

```bash
npm run report                # open UI HTML report
npm run allure:open           # open UI Allure report
npm run allure:open:api       # open API Allure report
```

## Environment selection

`cross-env` sets `ENV` before the config loads, e.g. `test:local` →
`ENV=local` → loads `.env` then overrides with `.env.local`. Add new
environments by adding `test:<name>` scripts the same way, plus a matching
`.env.<name>` file.

Credentials (`USERNAME`, `PASSWORD`) belong in `.env.local`/CI secrets,
never in the shared `.env` — see `env.config.ts`'s schema for what's
required.

## Adding a new UI data-driven suite

1. Drop your CSV/JSON in `test-data/`.
2. In your spec, declare a small inline `type` for the columns you use.
3. Call `readCsv<YourType>('your-file.csv')` and loop over it.
4. Add a `tags` column (`smoke|regression`) if it should run in those projects.

No new interface file. No new loader. No new page object unless the UI
under test is genuinely new.

## Adding a new API suite

1. Drop your JSON/CSV payload in `test-data/api/`.
2. Add a spec under `tests/api/`, import `test`/`expect` from `src/fixtures/api.fixture`.
3. Use `apiClient.get/post/put/delete()` + `apiClient.expectStatus()`.

Same generic data-provider, same inline-typing rule as UI.
