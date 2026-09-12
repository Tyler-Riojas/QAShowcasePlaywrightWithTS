/*
 * utils/AccessibilityUtils.ts
 *
 * Accessibility audit utilities powered by axe-core via @axe-core/playwright.
 *
 * axe-core severity levels:
 *   critical  — must fix; likely causes legal/compliance failure (WCAG 2.1 AA)
 *   serious   — should fix; significant barrier for users with disabilities
 *   moderate  — fix when possible; some users will be impacted
 *   minor     — best effort; low impact on accessibility
 *
 * Usage:
 *   await AccessibilityUtils.assertNoViolations(page)
 *   // or target a subset:
 *   await AccessibilityUtils.assertNoViolations(page, { include: ['#main'] })
 */

import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { AxeResults, RunOptions } from 'axe-core';

export class AccessibilityUtils {
  /** Run the full axe-core audit and return raw results */
  static async runAudit(page: Page, options?: RunOptions): Promise<AxeResults> {
    const builder = new AxeBuilder({ page });
    if (options) {
      // axe-core RunOptions maps to AxeBuilder config — apply common options
      if (options.runOnly) builder.withTags(options.runOnly as string[]);
    }
    return builder.analyze();
  }

  /**
   * Assert that the page has zero axe-core violations.
   * Throws a human-readable error listing each violation if any are found.
   */
  static async assertNoViolations(page: Page, options?: RunOptions): Promise<void> {
    const results = await AccessibilityUtils.runAudit(page, options);
    if (results.violations.length > 0) {
      const summary = await AccessibilityUtils.getViolationSummary(results);
      throw new Error(`Accessibility violations found:\n${summary}`);
    }
  }

  /**
   * Format axe violations into a readable summary for test failure messages.
   * Each violation shows: impact, rule ID, description, and affected element count.
   */
  static async getViolationSummary(results: AxeResults): Promise<string> {
    return results.violations
      .map(v => [
        `[${v.impact?.toUpperCase() ?? 'UNKNOWN'}] ${v.id}: ${v.description}`,
        `  Help: ${v.helpUrl}`,
        `  Nodes affected: ${v.nodes.length}`,
        ...v.nodes.slice(0, 3).map(n => `    - ${n.html}`),
      ].join('\n'))
      .join('\n\n');
  }
}
