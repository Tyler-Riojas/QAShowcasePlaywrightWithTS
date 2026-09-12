/*
 * tests/example-performance/performance.spec.ts
 *
 * Demonstrates: PerformanceUtils usage with Navigation Timing API.
 * Target: https://example.com (fast, stable reference page)
 *
 * Thresholds used here are intentionally loose (5 000ms) so the tests
 * pass reliably against any public URL. In your project, tighten them
 * to match your SLA (e.g. FCP < 1800ms for WCAG/Google CWV compliance).
 *
 * Note: LCP requires paint timing to be enabled. It may return 0 in
 * some headless environments — the tests skip LCP assertion if it is 0.
 *
 * Tags: @performance
 */

import { test, expect } from '../../fixtures/index';
import { PerformanceUtils } from '../../utils/PerformanceUtils';

const TARGET_URL = 'https://example.com';

// Adjust these thresholds to match your application's SLA
const THRESHOLDS = {
  fcp: 5000,   // Google CWV "good" = <1800ms; 5000ms for demo tolerance
  ttfb: 3000,  // Google CWV "good" = <800ms; 3000ms for demo tolerance
  load: 10000, // Full page load — should be well under 10s for any real app
};

test.describe('Performance Example @performance', () => {

  test('page FCP is within acceptable threshold', async ({ page }) => {
    await test.step('navigate to target page', async () => {
      await page.goto(TARGET_URL, { waitUntil: 'load' });
    });

    await test.step(`assert FCP < ${THRESHOLDS.fcp}ms`, async () => {
      const { fcp } = await PerformanceUtils.getMetrics(page);
      // FCP of 0 means the metric wasn't captured (headless limitation) — skip
      if (fcp > 0) {
        expect(fcp).toBeLessThanOrEqual(THRESHOLDS.fcp);
      }
    });
  });

  test('page TTFB is within acceptable threshold', async ({ page }) => {
    await test.step('navigate to target page', async () => {
      await page.goto(TARGET_URL, { waitUntil: 'load' });
    });

    await test.step(`assert TTFB < ${THRESHOLDS.ttfb}ms`, async () => {
      const { ttfb } = await PerformanceUtils.getMetrics(page);
      expect(ttfb).toBeLessThanOrEqual(THRESHOLDS.ttfb);
    });
  });

  test('page load completes within timeout', async ({ page }) => {
    await test.step('navigate and wait for full load', async () => {
      await page.goto(TARGET_URL, { waitUntil: 'load' });
    });

    await test.step(`assert loadComplete < ${THRESHOLDS.load}ms`, async () => {
      const { loadComplete } = await PerformanceUtils.getMetrics(page);
      expect(loadComplete).toBeLessThanOrEqual(THRESHOLDS.load);
    });

    await test.step('log all metrics for the report', async () => {
      const metrics = await PerformanceUtils.getMetrics(page);
      // Attach metrics to Playwright HTML report as a test annotation
      test.info().annotations.push({
        type: 'performance',
        description: JSON.stringify(metrics, null, 2),
      });
      // Sanity: at least one metric must be non-zero
      const anyNonZero = Object.values(metrics).some(v => v > 0);
      expect(anyNonZero).toBe(true);
    });
  });
});
