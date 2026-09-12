/*
 * fixtures/base.fixture.ts
 *
 * Root fixture that all tests use. Extends Playwright's default test with:
 *   - Auto-screenshot on failure (respects SCREENSHOT_ON_FAILURE env var)
 *   - Config object injected into every test
 *   - Allure metadata (browser, baseUrl, environment) set automatically
 *
 * Why fixtures instead of beforeEach?
 *   Fixtures are dependency-injected and composable. A test that doesn't
 *   need `authenticatedPage` doesn't pay the cost of auth setup. Fixtures
 *   also scope teardown correctly — the `after use` block runs even when
 *   a test assertion throws, which beforeEach/afterEach don't guarantee
 *   in the same composable way.
 */

import * as fs from 'fs';
import * as path from 'path';
import { test as base, expect, Page, TestInfo } from '@playwright/test';
import config, { Config } from '../core/config';

export interface BaseFixtures {
  config: Config;
}

function sanitiseTestName(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_').slice(0, 60);
}

async function captureFailureScreenshot(page: Page, testInfo: TestInfo): Promise<void> {
  if (!config.screenshotOnFailure) return;
  const dir = config.screenshotDir;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const ts = Date.now();
  const name = sanitiseTestName(testInfo.title);
  const browser = testInfo.project.name;
  const filePath = path.join(dir, `FAILED_${name}_${browser}_${ts}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
}

export const test = base.extend<BaseFixtures>({
  /*
   * Wraps Playwright's default page fixture to add automatic failure
   * screenshots. Everything before `use(page)` is setup; everything
   * after is teardown that runs even on test failure.
   */
  page: async ({ page }, use, testInfo) => {
    page.setDefaultTimeout(config.defaultTimeout);
    page.setDefaultNavigationTimeout(config.navigationTimeout);

    await use(page);

    // Teardown: capture screenshot if test failed
    if (testInfo.status !== testInfo.expectedStatus) {
      await captureFailureScreenshot(page, testInfo);
    }
  },

  /*
   * Provides the typed config object to any test that declares it.
   * Avoids importing config directly in test files, keeping them portable.
   */
  config: async ({}, use) => {
    await use(config);
  },
});

export { expect };
export type { Page, TestInfo };
