/*
 * utils/ScreenshotUtils.ts
 *
 * Screenshot capture utilities for explicit, programmatic screenshots.
 * Failure screenshots are handled automatically by base.fixture.ts —
 * use these methods for manual captures in test steps (e.g. before/after
 * a form submission, or to document a specific UI state for the report).
 */

import * as fs from 'fs';
import * as path from 'path';
import { Page } from '@playwright/test';
import config from '../core/config';

export class ScreenshotUtils {
  private static ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  private static buildPath(name: string): string {
    ScreenshotUtils.ensureDir(config.screenshotDir);
    return path.join(config.screenshotDir, `${name}_${Date.now()}.png`);
  }

  /** Capture a full-page screenshot and return the file path */
  static async capture(page: Page, name: string): Promise<string> {
    const filePath = ScreenshotUtils.buildPath(name);
    await page.screenshot({ path: filePath, fullPage: true });
    return filePath;
  }

  /** Capture a screenshot cropped to a specific element */
  static async captureElement(page: Page, selector: string, name: string): Promise<string> {
    const filePath = ScreenshotUtils.buildPath(name);
    await page.locator(selector).screenshot({ path: filePath });
    return filePath;
  }

  /** Capture a full-page screenshot (alias with explicit naming for clarity) */
  static async captureFullPage(page: Page, name: string): Promise<string> {
    return ScreenshotUtils.capture(page, name);
  }

  /**
   * Delete screenshots older than the specified number of minutes.
   * Useful in long CI runs to prevent disk space accumulation.
   */
  static async clearOldScreenshots(olderThanMinutes: number): Promise<void> {
    const dir = config.screenshotDir;
    if (!fs.existsSync(dir)) return;
    const cutoff = Date.now() - olderThanMinutes * 60 * 1000;
    for (const file of fs.readdirSync(dir)) {
      const filePath = path.join(dir, file);
      const { mtimeMs } = fs.statSync(filePath);
      if (mtimeMs < cutoff) fs.unlinkSync(filePath);
    }
  }
}
