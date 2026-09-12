/*
 * core/config.ts
 *
 * Central configuration object built from environment variables.
 * All settings have safe defaults so the template runs out-of-the-box
 * without a .env file. Override via .env or CI environment variables.
 *
 * Never import process.env directly in test files — import config instead.
 * This keeps all env-parsing in one place and makes tests testable with
 * different configs without manipulating process.env directly.
 */

const config = {
  // ── Target ──────────────────────────────────────────────────────────────
  /** Base URL for UI tests — set to your application root */
  baseUrl: process.env['BASE_URL'] ?? 'https://example.com',
  /** Separate base URL for API tests — may differ from UI base */
  apiBaseUrl: process.env['API_BASE_URL'] ?? '',

  // ── Browser ─────────────────────────────────────────────────────────────
  /** Which browser engine to use: chromium | firefox | webkit */
  browser: process.env['BROWSER'] ?? 'chromium',
  /** Run without a visible window — set to 'false' to watch tests run */
  headless: process.env['HEADLESS'] !== 'false',
  /** Milliseconds to wait between each action — useful for demos */
  slowMo: parseInt(process.env['SLOW_MO'] ?? '0'),
  /** Video recording mode: off | on | retain-on-failure */
  video: process.env['VIDEO'] ?? 'off',

  // ── Timeouts ─────────────────────────────────────────────────────────────
  /** Default timeout for actions (click, fill, etc.) in milliseconds */
  defaultTimeout: parseInt(process.env['DEFAULT_TIMEOUT'] ?? '30000'),
  /** Timeout for page.goto() and page.waitForNavigation() */
  navigationTimeout: parseInt(process.env['NAVIGATION_TIMEOUT'] ?? '30000'),
  /** Timeout for expect() assertions */
  expectTimeout: parseInt(process.env['EXPECT_TIMEOUT'] ?? '10000'),

  // ── Execution ────────────────────────────────────────────────────────────
  /** Number of parallel workers — set to 1 for sequential (debugging) */
  workers: parseInt(process.env['WORKERS'] ?? '4'),
  /** Number of retries on failure — applied only in CI by default */
  retries: parseInt(process.env['RETRIES'] ?? '1'),

  // ── Auth ─────────────────────────────────────────────────────────────────
  /** Username for form-based login flows */
  username: process.env['TEST_USERNAME'] ?? '',
  /** Password for form-based login flows */
  password: process.env['TEST_PASSWORD'] ?? '',
  /** Pre-issued bearer token for API auth — bypasses login flow */
  authToken: process.env['AUTH_TOKEN'] ?? '',

  // ── Reporting ─────────────────────────────────────────────────────────────
  /** Capture screenshot on every test failure */
  screenshotOnFailure: process.env['SCREENSHOT_ON_FAILURE'] !== 'false',
  /** Directory for screenshot files */
  screenshotDir: process.env['SCREENSHOT_DIR'] ?? 'screenshots',
  /** Directory for Allure raw results (consumed by allure generate) */
  allureResultsDir: process.env['ALLURE_RESULTS_DIR'] ?? 'allure-results',

  // ── Features ──────────────────────────────────────────────────────────────
  /** Enable axe-core accessibility audits in accessibility tests */
  accessibilityEnabled: process.env['ACCESSIBILITY_ENABLED'] === 'true',
  /** Enable Navigation Timing API performance assertions */
  performanceEnabled: process.env['PERFORMANCE_ENABLED'] === 'true',
  /** Enable mobile/tablet device emulation in non-device projects */
  deviceEmulation: process.env['DEVICE_EMULATION'] === 'true',
} as const;

export type Config = typeof config;
export default config;
