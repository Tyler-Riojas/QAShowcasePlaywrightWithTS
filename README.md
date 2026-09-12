# Playwright TypeScript Template Framework

A production-grade, configuration-driven Playwright TypeScript template that can be pointed at any web application or API. The TypeScript equivalent of a Selenium Java automation framework.

---

## What This Provides

| Capability | Implementation |
|---|---|
| Configuration-driven | `.env` → `core/config.ts` — no hardcoded values |
| Abstract page objects | `pages/BasePage.ts` — extend and start testing |
| Typed fixtures | `fixtures/base.fixture.ts` + `fixtures/auth.fixture.ts` |
| Dual reporting | Playwright HTML + Allure (with GitHub Pages deploy) |
| Multi-browser | Chromium, Firefox, WebKit, Pixel 5, iPhone 13, iPad Pro |
| API testing | `helpers/ApiHelper.ts` — typed `ApiResponse<T>` wrapper |
| Accessibility | `utils/AccessibilityUtils.ts` — axe-core, per-severity |
| Performance | `utils/PerformanceUtils.ts` — FCP, LCP, TTFB |
| Screenshot utils | Auto on failure + explicit `ScreenshotUtils.capture()` |
| Wait utilities | `utils/WaitUtils.ts` — custom conditions, polling |
| Test factories | `helpers/factories.ts` — unique IDs, emails, amounts |
| CI/CD | GitHub Actions — parallel jobs, Allure Pages deploy |

---

## Quick Start

```bash
# 1. Clone and install
npm install
npx playwright install

# 2. Configure (copy and edit)
cp .env.example .env

# 3. Run smoke tests
npm run test:smoke

# 4. Run API tests
npm run test:api

# 5. Open HTML report
npm run report:html
```

---

## Configuration

All settings read from environment variables (`.env` file or CI env). Edit `.env.example` → `.env`.

| Variable | Default | Description |
|---|---|---|
| `BASE_URL` | `https://example.com` | UI test target |
| `API_BASE_URL` | `` | API test target |
| `BROWSER` | `chromium` | Default browser engine |
| `HEADLESS` | `true` | Set `false` to watch tests |
| `SLOW_MO` | `0` | Ms delay between actions (demos) |
| `VIDEO` | `off` | `off` / `on` / `retain-on-failure` |
| `DEFAULT_TIMEOUT` | `30000` | Action timeout (ms) |
| `NAVIGATION_TIMEOUT` | `30000` | Page navigation timeout (ms) |
| `EXPECT_TIMEOUT` | `10000` | Assertion timeout (ms) |
| `WORKERS` | `4` | Parallel test workers |
| `RETRIES` | `1` | Retries on CI (0 locally) |
| `TEST_USERNAME` | `` | Login username |
| `TEST_PASSWORD` | `` | Login password |
| `AUTH_TOKEN` | `` | Pre-issued bearer token |
| `SCREENSHOT_ON_FAILURE` | `true` | Auto-screenshot on test fail |
| `ACCESSIBILITY_ENABLED` | `false` | Enable axe-core audits |
| `PERFORMANCE_ENABLED` | `false` | Enable timing assertions |

---

## Run Commands

```bash
# By browser
npm run test:chromium
npm run test:firefox
npm run test:webkit
npm run test:all-browsers

# By device
npm run test:mobile        # Pixel 5 + iPhone 13
npm run test:tablet        # iPad Pro

# By test type
npm run test:api
npm run test:smoke
npm run test:regression
npm run test:accessibility
npm run test:performance

# Debug
npm run test:headed        # Visible browser window
npm run test:debug         # Playwright inspector
npm run test:ui            # Playwright UI mode

# Reports
npm run report:html        # Open Playwright HTML report
npm run report:allure      # Serve Allure report live
npm run report:generate    # Build static Allure report

# Cleanup
npm run clean
```

---

## Project Structure

```
playwright-ts-template/
├── core/
│   ├── config.ts           # All env vars → typed Config object
│   └── types.ts            # Shared TypeScript interfaces and unions
├── fixtures/
│   ├── base.fixture.ts     # Root fixture: screenshot-on-fail, config injection
│   ├── auth.fixture.ts     # Auth fixture: token, authHeaders, authenticatedPage
│   └── index.ts            # Single import point for all fixtures
├── pages/
│   └── BasePage.ts         # Abstract base — extend for every page object
├── utils/
│   ├── WaitUtils.ts        # Explicit wait conditions and polling
│   ├── ScreenshotUtils.ts  # Capture / element / full-page / cleanup
│   ├── ReportUtils.ts      # Allure annotations (severity, issue, step, label)
│   ├── AccessibilityUtils.ts  # axe-core audit, per-severity assertions
│   └── PerformanceUtils.ts    # FCP, LCP, TTFB via Navigation Timing API
├── helpers/
│   ├── factories.ts        # generateEmail, generateAmount, generatePayload<T>
│   └── ApiHelper.ts        # Typed HTTP wrapper: get/post/put/patch/delete
├── tests/
│   ├── example-ui/         # UI test examples (BasePage, screenshot, responsive)
│   ├── example-api/        # API test examples (ApiHelper, auth, validation)
│   ├── example-accessibility/  # axe-core examples (critical, serious)
│   └── example-performance/    # Timing examples (FCP, TTFB, load)
├── .github/workflows/
│   └── ci.yml              # Parallel browser jobs + Allure Pages deploy
├── .env.example            # All configurable variables with documentation
├── playwright.config.ts    # Projects: desktop + mobile + tablet + API
└── tsconfig.json           # Strict mode, path aliases
```

---

## Adding a New Page Object

```typescript
// pages/LoginPage.ts
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  get path() { return '/login'; }

  async login(username: string, password: string): Promise<void> {
    await this.page.fill('#username', username);
    await this.page.fill('#password', password);
    await this.page.click('[type=submit]');
    await this.waitForNavigation();
  }

  async assertLoginError(message: string): Promise<void> {
    await this.assertText('.error', message);
  }
}
```

---

## Adding a New Test

```typescript
// tests/auth/login.spec.ts
import { test, expect } from '../../fixtures/index';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Login @smoke @regression', () => {
  test('valid credentials redirect to dashboard', async ({ page, config }) => {
    const login = new LoginPage(page, config.baseUrl);

    await test.step('navigate to login', async () => {
      await login.navigate();
    });

    await test.step('submit credentials', async () => {
      await login.login(config.username, config.password);
    });

    await test.step('assert dashboard loaded', async () => {
      await login.assertUrl('/dashboard');
    });
  });
});
```

---

## Reporting

### Playwright HTML Report
Generated automatically after every run. Open with:
```bash
npm run report:html
```

### Allure Report
Requires `allure-results/` directory (populated by `allure-playwright` reporter):
```bash
npm run report:generate   # Build static report
npm run report:allure     # Serve live (watches for changes)
```

In CI: Allure report is automatically deployed to GitHub Pages after all browser jobs complete.

---

## CI/CD

Four parallel jobs: `test-chromium`, `test-firefox`, `test-webkit`, `test-api`.

Each job:
1. Installs only the browser it needs (`--with-deps`)
2. Runs its test project
3. Uploads `allure-results/` as a 1-day artifact
4. Uploads `playwright-report/` on failure (7 days)
5. Uploads `junit.xml` always (7 days)

The `allure-report` job runs after all four, merges all `allure-results/` artifacts, generates a combined report, and deploys to GitHub Pages.

---

## Extending the Template

| What to add | Where |
|---|---|
| New page object | `pages/MyPage.ts` extending `BasePage` |
| New test helper | `helpers/MyHelper.ts` |
| New utility | `utils/MyUtils.ts` |
| New fixture | `fixtures/my.fixture.ts`, re-export from `fixtures/index.ts` |
| New env var | `.env.example` + `core/config.ts` |

---

## Java Template Comparison

| Concept | Selenium Java | Playwright TypeScript |
|---|---|---|
| Base test class | `BaseTest.java` (JUnit/TestNG) | `fixtures/base.fixture.ts` |
| Page object base | `BasePage.java` | `pages/BasePage.ts` |
| Driver management | `WebDriverManager` | Built into Playwright |
| Configuration | `config.properties` | `.env` → `core/config.ts` |
| Wait utilities | `ExplicitWait` helper | `utils/WaitUtils.ts` |
| API testing | RestAssured | `helpers/ApiHelper.ts` |
| Reporting | Allure + Extent | Allure + Playwright HTML |
| CI parallel | Maven Surefire forks | Playwright `workers` + GHA jobs |
| Data factories | Faker / POJOs | `helpers/factories.ts` |
| Accessibility | N/A (manual) | `utils/AccessibilityUtils.ts` |
| Performance | N/A (manual) | `utils/PerformanceUtils.ts` |
| Browser matrix | Selenium Grid | Playwright projects + CI jobs |
