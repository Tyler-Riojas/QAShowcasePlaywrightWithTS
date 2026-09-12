/*
 * utils/WaitUtils.ts
 *
 * Explicit wait utilities for situations where Playwright's built-in
 * auto-waiting isn't sufficient — typically: polling external state,
 * waiting for WebSocket messages, or asserting absence of elements.
 *
 * Prefer Playwright's built-in auto-wait (locator.click(), expect().toBeVisible())
 * over these methods wherever possible. Use WaitUtils only when you need
 * a custom condition that Playwright can't express natively.
 */

import { Page } from '@playwright/test';
import config from '../core/config';

export class WaitUtils {
  /** Wait for the network to go quiet (no pending requests) */
  static async waitForNetworkIdle(page: Page, timeout: number = config.defaultTimeout): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout });
  }

  /** Wait until a selector is visible in the DOM */
  static async waitForElementVisible(
    page: Page,
    selector: string,
    timeout: number = config.defaultTimeout,
  ): Promise<void> {
    await page.waitForSelector(selector, { state: 'visible', timeout });
  }

  /** Wait until a selector is removed from the DOM or hidden */
  static async waitForElementHidden(
    page: Page,
    selector: string,
    timeout: number = config.defaultTimeout,
  ): Promise<void> {
    await page.waitForSelector(selector, { state: 'hidden', timeout });
  }

  /** Wait until an element contains the expected text */
  static async waitForText(
    page: Page,
    selector: string,
    text: string,
    timeout: number = config.defaultTimeout,
  ): Promise<void> {
    await page.waitForFunction(
      ({ sel, txt }: { sel: string; txt: string }) => {
        const el = document.querySelector(sel);
        return el?.textContent?.includes(txt) ?? false;
      },
      { sel: selector, txt: text },
      { timeout },
    );
  }

  /** Wait until the current URL matches a string or regex */
  static async waitForUrl(
    page: Page,
    pattern: string | RegExp,
    timeout: number = config.defaultTimeout,
  ): Promise<void> {
    await page.waitForURL(pattern, { timeout });
  }

  /**
   * Poll a condition function until it returns true.
   * Useful for external state (database, queue) that the page doesn't reflect directly.
   */
  static async waitForCondition(
    page: Page,
    condition: () => Promise<boolean>,
    timeout: number = config.defaultTimeout,
    interval: number = 500,
  ): Promise<void> {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (await condition()) return;
      await WaitUtils.sleep(interval);
    }
    throw new Error(`waitForCondition timed out after ${timeout}ms`);
  }

  /**
   * Pause execution for a fixed duration.
   * Use sparingly — prefer explicit conditions over arbitrary sleeps.
   * Acceptable use cases: rate-limited APIs, animation settling, CI flake isolation.
   */
  static async sleep(ms: number): Promise<void> {
    await new Promise<void>(resolve => setTimeout(resolve, ms));
  }
}
