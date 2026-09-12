/*
 * pages/BasePage.ts
 *
 * Abstract base class that all page objects extend.
 *
 * Why page objects?
 *   Page objects centralise element selectors and interaction logic.
 *   When a selector changes, you update one place — not every test file.
 *   Tests read as user stories; pages encapsulate the how.
 *
 * How to use:
 *   class LoginPage extends BasePage {
 *     get path() { return '/login'; }
 *     async login(user: string, pass: string) { ... }
 *   }
 *
 *   const login = new LoginPage(page);
 *   await login.navigate();
 *   await login.login('user', 'pass');
 *   await login.assertTitle('Dashboard');
 */

import * as fs from 'fs';
import * as path from 'path';
import { Page, expect } from '@playwright/test';
import config from '../core/config';

export abstract class BasePage {
  constructor(
    protected readonly page: Page,
    protected readonly baseUrl: string = config.baseUrl,
  ) {}

  /** The URL path for this page — subclasses must implement this */
  abstract get path(): string;

  // ── Navigation ───────────────────────────────────────────────────────────

  /** Navigate to this page's path, optionally overriding with a sub-path */
  async navigate(subPath: string = this.path): Promise<void> {
    await this.page.goto(`${this.baseUrl}${subPath}`);
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  // ── Waiting ───────────────────────────────────────────────────────────────

  /**
   * Wait for the page to reach a specific load state.
   * 'networkidle' is the safest default for SPAs but slowest.
   * Use 'domcontentloaded' for faster navigation assertions.
   */
  async waitForLoad(state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle'): Promise<void> {
    await this.page.waitForLoadState(state);
  }

  async waitForSelector(selector: string, timeout?: number): Promise<void> {
    await this.page.waitForSelector(selector, { timeout: timeout ?? config.defaultTimeout });
  }

  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  // ── Screenshots ───────────────────────────────────────────────────────────

  /** Capture a named screenshot into the configured screenshots directory */
  async screenshot(name: string): Promise<void> {
    const dir = config.screenshotDir;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const ts = Date.now();
    const filePath = path.join(dir, `${name}_${ts}.png`);
    await this.page.screenshot({ path: filePath, fullPage: true });
  }

  // ── Assertion helpers ─────────────────────────────────────────────────────

  async assertTitle(expected: string): Promise<void> {
    await expect(this.page).toHaveTitle(expected);
  }

  async assertUrl(pattern: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }

  async assertVisible(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async assertText(selector: string, expected: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveText(expected);
  }

  // ── Scrolling ─────────────────────────────────────────────────────────────

  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async scrollToElement(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }
}
