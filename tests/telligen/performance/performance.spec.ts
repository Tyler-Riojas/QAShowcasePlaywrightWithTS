/*
 * tests/telligen/performance/performance.spec.ts
 *
 * Performance benchmarks for key Telligen pages.
 *
 * Healthcare sites are often image-heavy and CMS-driven (WordPress, Drupal).
 * Slow TTFB can indicate a cold server or CDN misconfiguration.
 * Slow FCP impacts SEO (Core Web Vitals are a Google ranking signal) and
 * accessibility (users on slow connections or assistive technology).
 *
 * Thresholds are intentionally conservative (5000ms FCP, 2000ms TTFB)
 * to account for CI network variability. Tighten against your SLA in prod.
 *
 * Tags: @performance @telligen
 */

import { test, expect } from '../../../fixtures/index';
import { PerformanceUtils } from '../../../utils/PerformanceUtils';

const BASE_URL = 'https://www.telligen.com';

const PAGES = [
  { name: 'Homepage',        path: '/',                   fcpThreshold: 5000, ttfbThreshold: 2000 },
  { name: 'About Us',        path: '/about-us/',           fcpThreshold: 5000, ttfbThreshold: 2000 },
  { name: 'Client Solutions', path: '/client-solutions/',  fcpThreshold: 5000, ttfbThreshold: 2000 },
];

test.describe('Telligen Performance @performance @telligen', () => {

  for (const { name, path, fcpThreshold, ttfbThreshold } of PAGES) {
    test(`${name} FCP and TTFB are under threshold`, async ({ page }) => {
      await test.step(`navigate to ${path}`, async () => {
        await page.goto(`${BASE_URL}${path}`, { waitUntil: 'load' });
      });

      await test.step('collect and assert performance metrics', async () => {
        const metrics = await PerformanceUtils.getMetrics(page);

        // Attach metrics to the Playwright HTML report and Allure
        test.info().annotations.push({
          type: 'performance-metrics',
          description: JSON.stringify(metrics, null, 2),
        });

        // FCP of 0 means the metric wasn't available (some headless configs) — skip
        if (metrics.fcp > 0) {
          expect(metrics.fcp, `${name} FCP ${metrics.fcp}ms exceeds ${fcpThreshold}ms`).toBeLessThanOrEqual(fcpThreshold);
        }

        expect(metrics.ttfb, `${name} TTFB ${metrics.ttfb}ms exceeds ${ttfbThreshold}ms`).toBeLessThanOrEqual(ttfbThreshold);

        // Sanity: page must have actually loaded
        expect(metrics.loadComplete, `${name} load never completed`).toBeGreaterThan(0);
      });
    });
  }

  test('homepage performance on mobile viewport', async ({ page }) => {
    await test.step('set mobile viewport (iPhone 13)', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
    });

    await test.step('navigate to homepage', async () => {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'load' });
    });

    await test.step('collect and assert mobile performance metrics', async () => {
      const metrics = await PerformanceUtils.getMetrics(page);

      test.info().annotations.push({
        type: 'performance-metrics-mobile',
        description: JSON.stringify(metrics, null, 2),
      });

      // Mobile threshold is higher — networks are slower and JS execution takes longer
      if (metrics.fcp > 0) {
        expect(metrics.fcp, `Mobile FCP ${metrics.fcp}ms exceeds 8000ms`).toBeLessThanOrEqual(8000);
      }

      expect(metrics.loadComplete, 'Mobile load never completed').toBeGreaterThan(0);
    });
  });
});
