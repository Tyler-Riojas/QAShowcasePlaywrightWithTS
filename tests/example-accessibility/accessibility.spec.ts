/*
 * tests/example-accessibility/accessibility.spec.ts
 *
 * Demonstrates: AccessibilityUtils usage with axe-core.
 * Target: https://the-internet.herokuapp.com/login (a stable public page)
 *
 * axe-core severity levels (from most to least severe):
 *   critical  — legal exposure; WCAG 2.1 Level AA failure (e.g. missing form label)
 *   serious   — significant barrier; screen reader can't navigate content
 *   moderate  — some users impacted; colour contrast, landmark issues
 *   minor     — best practice; low real-world impact
 *
 * Strategy: Run separate tests per severity level so CI can fail on
 * critical/serious while allowing moderate/minor to be informational.
 *
 * Tags: @accessibility
 */

import { test, expect } from '../../fixtures/index';
import { AccessibilityUtils } from '../../utils/AccessibilityUtils';

const TARGET_URL = 'https://the-internet.herokuapp.com/login';

test.describe('Accessibility Example @accessibility', () => {

  test('page has no critical accessibility violations', async ({ page }) => {
    await test.step('navigate to target page', async () => {
      await page.goto(TARGET_URL);
    });

    await test.step('run axe audit and filter for critical violations', async () => {
      const results = await AccessibilityUtils.runAudit(page);
      const critical = results.violations.filter(v => v.impact === 'critical');

      if (critical.length > 0) {
        const summary = await AccessibilityUtils.getViolationSummary({
          ...results,
          violations: critical,
        });
        throw new Error(`Critical accessibility violations found:\n${summary}`);
      }
      // Pass condition: zero critical violations
      expect(critical.length).toBe(0);
    });
  });

  test('page has no serious accessibility violations', async ({ page }) => {
    await test.step('navigate to target page', async () => {
      await page.goto(TARGET_URL);
    });

    await test.step('run axe audit and filter for serious violations', async () => {
      const results = await AccessibilityUtils.runAudit(page);
      const serious = results.violations.filter(v => v.impact === 'serious');

      if (serious.length > 0) {
        const summary = await AccessibilityUtils.getViolationSummary({
          ...results,
          violations: serious,
        });
        throw new Error(`Serious accessibility violations found:\n${summary}`);
      }
      expect(serious.length).toBe(0);
    });
  });
});
