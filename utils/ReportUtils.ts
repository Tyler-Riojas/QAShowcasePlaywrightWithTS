/*
 * utils/ReportUtils.ts
 *
 * Allure reporting helpers. Wraps allure-playwright's annotation API with
 * typed, concise methods so tests don't need to import allure directly.
 *
 * Allure annotations are no-ops when allure-playwright is not the active
 * reporter, so these methods are safe to call unconditionally.
 *
 * Usage in tests:
 *   await ReportUtils.step('Fill login form', async () => { ... })
 *   ReportUtils.severity('critical')
 *   ReportUtils.issue('JIRA-1234')
 */

import { test } from '@playwright/test';
import type { AllureSeverity } from '../core/types';

export class ReportUtils {
  /**
   * Named step that appears in both the Playwright HTML report and Allure.
   * Prefer test.step() for simple nesting; use this when you also want
   * the step to appear as a distinct Allure step with its own timeline.
   */
  static async step(name: string, fn: () => Promise<void>): Promise<void> {
    await test.step(name, fn);
  }

  /** Attach a text/JSON/HTML string as an Allure attachment */
  static attachment(name: string, content: string, type: 'text/plain' | 'application/json' | 'text/html' = 'text/plain'): void {
    test.info().attach(name, { body: Buffer.from(content), contentType: type });
  }

  /** Add a custom label to the Allure report */
  static label(name: string, value: string): void {
    test.info().annotations.push({ type: name, description: value });
  }

  /** Set the Allure severity for the current test */
  static severity(level: AllureSeverity): void {
    test.info().annotations.push({ type: 'severity', description: level });
  }

  /** Add a description paragraph to the Allure report */
  static description(text: string): void {
    test.info().annotations.push({ type: 'description', description: text });
  }

  /** Add a hyperlink to the Allure report (e.g. design doc, API spec) */
  static link(url: string, name?: string): void {
    test.info().annotations.push({ type: 'link', description: name ? `${name} ${url}` : url });
  }

  /** Link the test to a JIRA/Linear/GitHub issue ID */
  static issue(id: string): void {
    test.info().annotations.push({ type: 'issue', description: id });
  }
}
