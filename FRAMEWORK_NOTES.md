# Playwright TypeScript Template — Framework Notes

## The Org Chart

════════════════════════════════════════════════════════
LEVEL 0 — ENVIRONMENT
════════════════════════════════════════════════════════
.env
└── raw settings (human editable)
└── BASE_URL, HEADLESS, WORKERS, TIMEOUTS, AUTH, FEATURES

════════════════════════════════════════════════════════
LEVEL 1 — CONFIGURATION
════════════════════════════════════════════════════════
core/config.ts
└── reads .env via process.env
└── exports typed Config object (as const — immutable)
└── provides safe defaults via ?? operator

core/types.ts
└── shared TypeScript types used across framework

playwright.config.ts
└── imports config.ts
└── defines projects (chromium, firefox, webkit, mobile, api)
└── defines reporters (html, allure, junit, list)
└── global timeouts, workers, retries

════════════════════════════════════════════════════════
LEVEL 2 — INFRASTRUCTURE
════════════════════════════════════════════════════════

FIXTURES
fixtures/base.fixture.ts
└── extends Playwright base test
└── provides: page (auto-screenshot on failure), config
└── sets timeouts from config
└── EVERY test uses this

fixtures/auth.fixture.ts
└── extends base.fixture (NOT Playwright directly)
└── provides: token, authHeaders, authenticatedPage
└── three strategies: pre-issued token, login, empty
└── only auth tests use this

fixtures/index.ts
└── THE GATE — single import point
└── re-exports everything from fixture files
└── tests import from here only
└── reorganize internals without breaking tests

PAGE OBJECTS
pages/BasePage.ts
└── abstract base all page objects extend
└── navigation waits only (is the PAGE ready?)
└── navigate(), waitForLoad(), waitForNavigation()
└── assertTitle(), assertUrl(), assertVisible()

UTILITIES
utils/WaitUtils.ts → custom CONDITIONS (is condition met?)
utils/ScreenshotUtils.ts → screenshot management
utils/ReportUtils.ts → Allure annotations
utils/AccessibilityUtils.ts → axe-core audits
utils/PerformanceUtils.ts → FCP, LCP, TTFB metrics

HELPERS
helpers/factories.ts → unique test data generation
helpers/ApiHelper.ts → typed HTTP wrapper

════════════════════════════════════════════════════════
LEVEL 3 — TESTS
════════════════════════════════════════════════════════
tests/example-ui/ @smoke
tests/example-api/ @smoke @api
tests/example-accessibility/ @accessibility
tests/example-performance/ @performance

════════════════════════════════════════════════════════
LEVEL 4 — OUTPUT
════════════════════════════════════════════════════════
playwright-report/ → HTML report (npm run report:html)
allure-results/ → raw JSON (input for allure generate)
allure-report/ → generated report (npm run report:allure)
screenshots/ → FAILED_testname_browser_timestamp.png
test-results/ → junit.xml (for Azure DevOps / CI)


---

## One File One Job

| File | Its ONE Job |
|------|------------|
| `.env` | Store raw settings |
| `core/config.ts` | Read .env, export typed object |
| `playwright.config.ts` | Configure the test runner |
| `fixtures/base.fixture.ts` | Manage browser lifecycle + screenshots |
| `fixtures/auth.fixture.ts` | Manage authentication |
| `fixtures/index.ts` | Be the gate — single import point |
| `pages/BasePage.ts` | Manage page navigation and interactions |
| `utils/WaitUtils.ts` | Custom wait conditions |
| `utils/ScreenshotUtils.ts` | Screenshot capture and management |
| `utils/ReportUtils.ts` | Allure report annotations |
| `utils/AccessibilityUtils.ts` | Accessibility audits |
| `utils/PerformanceUtils.ts` | Performance metrics |
| `helpers/factories.ts` | Generate unique test data |
| `helpers/ApiHelper.ts` | Typed HTTP requests |

---

## The Three Layers Of Waiting

### Layer 1 — Playwright Auto-Wait (Use First — 90% of cases)
Built into EVERY Playwright action automatically.
No code needed. Just call the action.

```typescript
await page.click('#submit');           // waits until clickable
await page.fill('#username', 'Admin'); // waits until fillable
await page.goto('/dashboard');         // waits for page load
await expect(locator).toBeVisible();   // retries until visible
await expect(page).toHaveURL('/home'); // retries until URL matches
```

Playwright waits for element to be:
- Visible
- Enabled
- Stable (not animating)
- Clickable

### Layer 2 — Playwright Explicit Wait (Use When Needed)
For specific page-level conditions.

```typescript
await page.waitForSelector('.element');
await page.waitForURL('/dashboard');
await page.waitForLoadState('networkidle');
await page.waitForNavigation();
```

### Layer 3 — WaitUtils (Use For Special Cases Only)
For complex custom conditions Playwright can't handle.

```typescript
// Element disappears (spinner)
await WaitUtils.waitForElementHidden(page, '.spinner', 30000);

// Specific text appears
await WaitUtils.waitForText(page, '.status', 'Complete', 10000);

// Network completely idle
await WaitUtils.waitForNetworkIdle(page, 10000);

// Custom JavaScript condition
await WaitUtils.waitForCondition(
    page,
    async () => await page.evaluate(() => window.ready === true),
    30000,
    500  // check every 500ms
);

// Last resort — avoid if possible
await WaitUtils.sleep(2000);
```

### When To Use Each

| Situation | Use |
|-----------|-----|
| Clicking a button | Playwright auto-wait |
| Filling a form | Playwright auto-wait |
| Asserting element visible | expect().toBeVisible() |
| Asserting URL changed | expect().toHaveURL() |
| Waiting for page load | BasePage.waitForLoad() |
| Waiting for redirect | BasePage.waitForNavigation() |
| Waiting for spinner to disappear | WaitUtils.waitForElementHidden() |
| Waiting for specific text | WaitUtils.waitForText() |
| Waiting for custom JS condition | WaitUtils.waitForCondition() |
| Complex async operation | WaitUtils.waitForNetworkIdle() |
| Absolute last resort | WaitUtils.sleep() |

### Selenium vs Playwright Waits

| Selenium | Playwright Equivalent |
|----------|----------------------|
| Implicit wait | Built-in auto-wait (always on) |
| Explicit WebDriverWait | expect() assertions + WaitUtils |
| Fluent wait | WaitUtils.waitForCondition() with interval |
| ExpectedConditions.visibilityOf() | expect().toBeVisible() |
| ExpectedConditions.invisibilityOf() | WaitUtils.waitForElementHidden() |
| ExpectedConditions.textToBePresentIn() | WaitUtils.waitForText() |
| ExpectedConditions.urlContains() | expect().toHaveURL() |

---

## BasePage vs WaitUtils — The Boundary

BasePage asks: "Is the PAGE ready?"
WaitUtils asks: "Is the CONDITION met?"
Playwright asks: "Is the ELEMENT ready?"

BasePage — navigation waits:
waitForLoad() page fully loaded
waitForNavigation() after clicking a link
waitForSelector() specific element appeared

WaitUtils — condition waits:
waitForElementHidden() spinner gone
waitForText() text appeared
waitForCondition() custom JS condition
waitForNetworkIdle() all requests complete


---

## Fixture Rules

### Rule 1 — Which Fixture To Use

| Test needs | Use |
|------------|-----|
| Just a browser page | `test` from base.fixture |
| Auth token for API | `authenticatedTest` + `authHeaders` |
| Logged-in browser | `authenticatedTest` + `authenticatedPage` |
| Both API + UI auth | `authenticatedTest` + both |

### Rule 2 — Import From Gate Only
```typescript
// ✅ Always import from index (the gate)
import { test, expect } from '@fixtures/index';
import { authenticatedTest } from '@fixtures/index';

// ❌ Never import directly from fixture files
import { test } from '../fixtures/base.fixture';
```

Exception: one-off special fixtures used by only one test file
can be imported directly, bypassing the gate.

### Rule 3 — Fixture Chain (Never Skip Levels)

Playwright base
↓
base.fixture ← extends Playwright
↓
auth.fixture ← extends base.fixture (NOT Playwright)
↓
tests ← use fixtures via index.ts


auth.fixture extends base.fixture so authenticated tests
automatically get screenshots on failure and config injection.

### Rule 4 — The use() Pattern
```typescript
fixture: async ({ dependency }, use) => {
    // SETUP — runs before test
    const value = await setup();

    await use(value);  // TEST RUNS HERE

    // TEARDOWN — runs after test (always, even on failure)
    await cleanup();
}
```

Everything before use() = setup
Everything after use()  = teardown (guaranteed to run)

This is better than @BeforeMethod/@AfterMethod because
teardown ALWAYS runs even when tests throw errors.

### Rule 5 — Fixtures Are Composable
```typescript
// Test declares EXACTLY what it needs:
test('no auth', async ({ page }) => { })
test('needs config', async ({ page, config }) => { })
authenticatedTest('needs token', async ({ authHeaders }) => { })
authenticatedTest('needs browser', async ({ authenticatedPage }) => { })

// Playwright injects only what's declared
// Tests don't pay for what they don't use
```

### Rule 6 — index.ts Is The Gate
```typescript
// Adding new fixture:
// 1. Create fixtures/my.fixture.ts
// 2. Add to fixtures/index.ts:
export { myFixture } from './my.fixture';
// 3. Tests import from @fixtures/index
// 4. Reorganize internals freely — tests never break
```

---

## TypeScript Key Concepts

### ?? Nullish Coalescing (the else operator)
```typescript
process.env.BASE_URL ?? 'https://example.com'
// "use BASE_URL if set, otherwise use the default"
// Only falls back on null or undefined (not 0 or "")
```

### as const (freeze the values)
```typescript
const config = { baseUrl: 'https://example.com' } as const;
// config.baseUrl cannot be reassigned
// Values are locked for entire test run
```

### strict: true (lock the types)
```typescript
// tsconfig.json: "strict": true
// Types cannot change:
let amount: number = 100;
amount = "100";  // ❌ ERROR — must be number
```

### Together:

strict: true = types cannot change (shape is locked)
as const = values cannot change (state is locked)
Result = config is completely predictable


### interface = declare shape
```typescript
interface AuthFixtures {
    token: string;        // declares WHAT exists
    authHeaders: { ... }; // and its TYPE
}
// Used by TypeScript for compile-time checking
// Disappears at runtime
```

### export / import
```typescript
// export = make available to other files (like Java public)
export function createPayload() { }
export interface BookingPayload { }

// import = use from another file
import { createPayload, BookingPayload } from './factories';
```

### ... spread operator
```typescript
use: { ...devices['iPad Pro'] }
// Unpacks all iPad Pro properties into use object
// Shorthand for typing every property manually
// "give me everything inside this object"
```

### async / await
```typescript
// Every Playwright action is async (takes time)
// await = wait for this to complete before continuing
await page.click('#button');  // wait for click to complete
await page.goto('/login');    // wait for navigation

// Java equivalent:
// driver.findElement(By.id("button")).click();
// (Selenium was synchronous — no await needed)
```

---

## Run Commands Quick Reference

```bash
# By browser
npm run test:chromium
npm run test:firefox
npm run test:webkit
npm run test:all-browsers

# By device
npm run test:mobile
npm run test:tablet

# By type
npm run test:api
npm run test:smoke
npm run test:regression
npm run test:accessibility
npm run test:performance

# Debug modes
npm run test:headed      # watch the browser
npm run test:debug       # Playwright inspector
npm run test:ui          # Playwright UI mode

# Override settings on command line
HEADLESS=false npm run test:smoke
SLOW_MO=500 HEADLESS=false npm run test:chromium
BASE_URL=https://myapp.com npm run test:smoke
ACCESSIBILITY_ENABLED=true npm run test:chromium
WORKERS=1 npm run test:smoke

# Reports
npm run report:html
npm run report:allure
npm run report:generate

# Cleanup
npm run clean
```

---

## Adding A New Target App (The Whole Point)

```bash
# Step 1 — Update .env only
BASE_URL=https://myapp.com
API_BASE_URL=https://api.myapp.com
TEST_USERNAME=myuser
TEST_PASSWORD=mypassword

# Step 2 — Create page objects
# pages/LoginPage.ts extends BasePage
# pages/DashboardPage.ts extends BasePage

# Step 3 — Write tests
# tests/myapp/login.spec.ts
# tests/myapp/dashboard.spec.ts

# Step 4 — Add to testMatch in playwright.config.ts
# { name: 'chromium', testMatch: ['tests/myapp/**'] }

# Step 5 — Run
npm run test:smoke

# Zero infrastructure changes needed
# Same framework — new recipes
```

---

## Restaurant Analogy Quick Reference

.env = manager's settings per location
core/config.ts = franchise operations manual
playwright.config.ts = the restaurant building
base.fixture.ts = chef's standard uniform
auth.fixture.ts = members-only section keycard
fixtures/index.ts = the front door (gate)
pages/BasePage.ts = standard recipe template
page objects = specific recipes
utils/WaitUtils.ts = kitchen timer (custom conditions)
utils/ScreenshotUtils = food photographer
utils/AccessibilityUtils = health inspector
utils/PerformanceUtils = speed timer
helpers/factories.ts = prep kitchen (fresh ingredients)
helpers/ApiHelper.ts = delivery service
tests/ = the dishes being served
playwright-report/ = daily inspection report
allure-report/ = michelin star evaluation
GitHub Pages = public health grade on the door
CI/CD jobs = kitchen stations running in parallel

"The template is the franchise system.
Page objects are the recipes.
Tests are the dishes.
Build the kitchen once.
Then just write recipes."

