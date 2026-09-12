/*
 * tests/telligen/accessibility/accessibility.spec.ts
 *
 * Accessibility audits for key Telligen pages using axe-core.
 *
 * Healthcare sites carry heightened accessibility obligations:
 *   - Section 508 (federal contractors like Telligen)
 *   - WCAG 2.1 Level AA
 *   - ADA Title III (web accessibility as a public accommodation)
 *
 * Critical violations = immediate legal and compliance exposure.
 * We audit per-page so failures are scoped to the broken page, not the suite.
 *
 * Tags: @accessibility @telligen
 */

import { test, expect } from '../../../fixtures/index';
import { AccessibilityUtils } from '../../../utils/AccessibilityUtils';

const BASE_URL = 'https://www.telligen.com';

const PAGES = [
  { name: 'Homepage', path: '/' },
  { name: 'About Us', path: '/about-us/' },
  { name: 'Health Equity', path: '/health-equity/' },
  { name: 'Client Solutions', path: '/client-solutions/' },
  { name: 'Contact Us', path: '/contact-us/' },
];

/** Dismisses a cookie banner if visible — failure here must not fail the a11y test */
async function dismissCookieBannerIfPresent(page: import('@playwright/test').Page): Promise<void> {
  try {
    const banner = page.locator(
      'button:has-text("Accept"), button:has-text("Got it"), button:has-text("OK"), ' +
      'button:has-text("Accept All"), button:has-text("Accept Cookies")',
    ).first();
    await banner.click({ timeout: 3000 });
  } catch {
    // No banner — proceed
  }
}

test.describe('Telligen Accessibility @accessibility @telligen', () => {

  // Generate one test per page — scoped failures are easier to triage than one mega-test
  for (const { name, path } of PAGES) {
    test(`${name} has no critical accessibility violations`, async ({ page }) => {
      await test.step(`navigate to ${path}`, async () => {
        await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
        await dismissCookieBannerIfPresent(page);
      });

      await test.step('run axe-core audit', async () => {
        const results = await AccessibilityUtils.runAudit(page);

        // Separate by severity so we can report count per level
        const critical = results.violations.filter(v => v.impact === 'critical');
        const serious  = results.violations.filter(v => v.impact === 'serious');
        const moderate = results.violations.filter(v => v.impact === 'moderate');

        // Attach full summary to the Playwright report for reference
        if (results.violations.length > 0) {
          const summary = await AccessibilityUtils.getViolationSummary(results);
          test.info().annotations.push({
            type: 'accessibility-violations',
            description: summary,
          });
        }

        // Log severity breakdown regardless of pass/fail
        test.info().annotations.push({
          type: 'a11y-summary',
          description: `critical=${critical.length} serious=${serious.length} moderate=${moderate.length}`,
        });

        if (critical.length > 0) {
          const summary = await AccessibilityUtils.getViolationSummary({ ...results, violations: critical });
          throw new Error(`${name}: ${critical.length} critical accessibility violation(s):\n${summary}`);
        }

        expect(critical.length, `${name} must have 0 critical violations`).toBe(0);
      });
    });
  }

  test('homepage accessibility on mobile viewport', async ({ page }) => {
    await test.step('set iPhone 13 viewport', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
    });

    await test.step('navigate to homepage', async () => {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      await dismissCookieBannerIfPresent(page);
    });

    await test.step('run axe-core audit on mobile viewport', async () => {
      const results = await AccessibilityUtils.runAudit(page);
      const critical = results.violations.filter(v => v.impact === 'critical');

      if (critical.length > 0) {
        const summary = await AccessibilityUtils.getViolationSummary({ ...results, violations: critical });
        throw new Error(`Homepage mobile: ${critical.length} critical violation(s):\n${summary}`);
      }

      expect(critical.length).toBe(0);
    });
  });
});
