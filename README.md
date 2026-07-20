# Playwright Enterprise Framework

A modern, CI-ready Playwright framework: typed config, reusable auth
sessions, structured logging, scalable data-driven testing, and a
Page Object layer — built to stay maintainable as the suite grows into
hundreds of tests, not just a handful.

## Key capabilities

- **Environment management** — schema-validated config (`env.config.ts`),
  fails fast on missing/malformed vars instead of failing mid-run.
- **Authentication reuse** — `auth.setup.ts` logs in once, every test
  starts pre-authenticated via saved storage state (fast, realistic CI runs).
- **Scalable data-driven testing** — a single generic loader
  (`data-provider.util.ts`: `readCsv<T>()`, `readJson<T>()`,
  `readCsvByTag<T>()`) powers every data file. Each spec types only the
  fields it needs, inline — so the framework scales to hundreds of data
  files without hundreds of interface files to maintain.
- **Page Object Model** — `BasePage` + concrete pages, kept lean and
  extendable per feature.
- **CI/CD pipeline** — GitHub Actions workflow: typecheck → test →
  HTML/JUnit report artifacts, ready to gate PRs.
- **Structured logging** — lightweight, timestamped, CI-greppable.

**Rule of thumb on typing data:** a data file earns its own shared type
in `src/types/` only if its shape is a real cross-cutting domain object
referenced by many specs (e.g. "Customer"). A one-off test data file
uses an inline type instead.

## What's deliberately *not* in here

- No custom logging framework (winston/pino) — Playwright's trace viewer
  and HTML report already give step-level detail. `logger.util.ts` is a
  20-line console wrapper, upgrade only if you ship logs externally.
- No per-environment config classes — one `.env` + `.env.<ENV>` override,
  validated once with zod at startup.
- No abstract "component object" layer on top of Page Objects — just
  `BasePage` + concrete pages. Add a `components/` folder only when you
  have a real repeated widget (e.g. a nav bar on every page).
- No custom test runner / BDD layer (Cucumber, etc.) — plain Playwright
  test + `test.describe` reads fine for most teams and keeps the stack
  boring and debuggable.

## Structure

```
playwright-enterprise-framework/
├── .github/workflows/playwright.yml   # CI: typecheck, run, upload report
├── src/
│   ├── config/env.config.ts           # validated env, one file
│   ├── fixtures/base.fixture.ts       # extend Playwright test ONCE here
│   ├── pages/
│   │   ├── base.page.ts
│   │   └── login.page.ts
│   └── utils/
│       ├── data-provider.util.ts      # <-- the generic CSV/JSON loader
│       └── logger.util.ts
├── tests/
│   ├── auth.setup.ts                  # log in once, reuse storage state
│   └── login.spec.ts                  # shows the inline-type pattern
├── test-data/
│   ├── login-users.csv
│   └── credentials.json
├── .env
├── playwright.config.ts
└── package.json
```

## Getting started

```bash
npm install
npm run install:browsers
npm test
```

Run just the smoke suite (uses the `tags` column in the CSV, no second
data file needed):

```bash
npm run test:smoke
```

## Adding a new data-driven suite (the actual point of this framework)

1. Drop your CSV/JSON in `test-data/`.
2. In your spec, declare a small inline `type` for the columns you use.
3. Call `readCsv<YourType>('your-file.csv')` and loop over it.

No new interface file. No new loader. No new page object unless the UI
under test is genuinely new.

## To run single test
npm run test:local -- tests/login.spec.ts


