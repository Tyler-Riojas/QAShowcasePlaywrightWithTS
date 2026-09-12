/*
 * utils/PerformanceUtils.ts
 *
 * Web performance measurement using the Navigation Timing API and
 * PerformanceObserver (via page.evaluate). No external dependencies.
 *
 * Metrics explained:
 *   TTFB  — Time to First Byte: how fast the server responds. >600ms is poor.
 *   FCP   — First Contentful Paint: first text/image visible. >1800ms is poor.
 *   LCP   — Largest Contentful Paint: main content visible. >2500ms is poor.
 *   DCL   — DOMContentLoaded: HTML parsed, scripts deferred.
 *   Load  — load event: all resources (images, CSS, scripts) fetched.
 *
 * Note: LCP requires a real browser with paint timing enabled. It may return
 * 0 in some headless configurations — check browser support before asserting.
 */

import { Page } from '@playwright/test';
import type { PerformanceMetrics } from '../core/types';

export class PerformanceUtils {
  /** Collect all timing metrics from the current page's Navigation Timing API */
  static async getMetrics(page: Page): Promise<PerformanceMetrics> {
    const metrics = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = (performance.getEntriesByType as any)('navigation')[0] as PerformanceNavigationTiming;
      return {
        ttfb: Math.round(nav.responseStart - nav.requestStart),
        fcp: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0),
        lcp: 0, // populated separately via PerformanceObserver below
        domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
        loadComplete: Math.round(nav.loadEventEnd - nav.startTime),
      };
    });

    // LCP must be measured via PerformanceObserver which buffers paint entries
    const lcp = await page.evaluate((): Promise<number> =>
      new Promise(resolve => {
        let value = 0;
        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries();
          if (entries.length > 0) value = Math.round(entries[entries.length - 1]!.startTime);
        });
        try {
          // largest-contentful-paint is a valid entry type in browsers but not in TS DOM lib
          (observer.observe as (o: { type: string; buffered: boolean }) => void)({ type: 'largest-contentful-paint', buffered: true });
        } catch {
          // Not supported in this browser/headless mode
        }
        // Resolve after a short tick to allow buffered entries to flush
        setTimeout(() => resolve(value), 100);
      }),
    );

    return { ...metrics, lcp };
  }

  /** Assert FCP is below the given threshold in milliseconds */
  static async assertFCP(page: Page, maxMs: number): Promise<void> {
    const { fcp } = await PerformanceUtils.getMetrics(page);
    if (fcp > maxMs) {
      throw new Error(`FCP ${fcp}ms exceeds threshold ${maxMs}ms`);
    }
  }

  /** Assert LCP is below the given threshold in milliseconds */
  static async assertLCP(page: Page, maxMs: number): Promise<void> {
    const { lcp } = await PerformanceUtils.getMetrics(page);
    if (lcp > 0 && lcp > maxMs) {
      throw new Error(`LCP ${lcp}ms exceeds threshold ${maxMs}ms`);
    }
  }

  /** Assert TTFB is below the given threshold in milliseconds */
  static async assertTTFB(page: Page, maxMs: number): Promise<void> {
    const { ttfb } = await PerformanceUtils.getMetrics(page);
    if (ttfb > maxMs) {
      throw new Error(`TTFB ${ttfb}ms exceeds threshold ${maxMs}ms`);
    }
  }
}
