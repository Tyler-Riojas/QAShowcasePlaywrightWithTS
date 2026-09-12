/*
 * core/types.ts
 *
 * Shared TypeScript types used across the template.
 * Import from here rather than re-declaring types in multiple files.
 */

/** Playwright's three supported browser engines */
export type BrowserName = 'chromium' | 'firefox' | 'webkit';

/** Test categorisation tags — used with --grep to run subsets */
export type TestTag =
  | '@smoke'
  | '@regression'
  | '@accessibility'
  | '@performance'
  | '@api';

/** Viewport dimensions for responsive testing */
export interface ViewportSize {
  width: number;
  height: number;
}

/** Device emulation profile for mobile/tablet tests */
export interface DeviceProfile {
  name: string;
  viewport: ViewportSize;
  userAgent: string;
  isMobile: boolean;
  hasTouch: boolean;
  deviceScaleFactor: number;
}

/**
 * Typed wrapper around a raw HTTP response.
 * ApiHelper returns this type so callers get status, body, and headers
 * without needing to parse the raw APIResponse object.
 */
export interface ApiResponse<T> {
  status: number;
  body: T;
  headers: Record<string, string>;
}

/** Metadata attached to a test for Allure reporting */
export interface TestMetadata {
  tags: TestTag[];
  description: string;
}

/** Core Web Vitals and Navigation Timing metrics */
export interface PerformanceMetrics {
  /** First Contentful Paint — first text or image rendered (ms) */
  fcp: number;
  /** Largest Contentful Paint — largest visible element rendered (ms) */
  lcp: number;
  /** Time to First Byte — server response time (ms) */
  ttfb: number;
  /** DOMContentLoaded event fired (ms) */
  domContentLoaded: number;
  /** load event fired — all resources fetched (ms) */
  loadComplete: number;
}

/** Allure severity levels for test prioritisation */
export type AllureSeverity =
  | 'blocker'
  | 'critical'
  | 'normal'
  | 'minor'
  | 'trivial';
