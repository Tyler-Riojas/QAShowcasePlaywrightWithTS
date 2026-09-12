/*
 * playwright.config.ts
 *
 * Central Playwright configuration. All values come from core/config.ts
 * which reads from environment variables. To customise: edit .env, not this file.
 *
 * Projects are organised by purpose:
 *   Desktop browsers  — chromium, firefox, webkit
 *   Mobile            — mobile-chrome (Pixel 5), mobile-safari (iPhone 13)
 *   Tablet            — tablet (iPad Pro)
 *   API               — no browser, pure HTTP testing
 */

import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import config from './core/config';

export default defineConfig({
  timeout: config.defaultTimeout,
  retries: process.env['CI'] ? config.retries : 0,
  workers: config.workers,
  fullyParallel: true,
  testDir: './tests',

  use: {
    baseURL: config.baseUrl,
    headless: config.headless,
    screenshot: 'only-on-failure',
    video: config.video as 'off' | 'on' | 'retain-on-failure' | 'on-first-retry',
    trace: 'on-first-retry',
    actionTimeout: config.defaultTimeout,
    navigationTimeout: config.navigationTimeout,
    launchOptions: {
      slowMo: config.slowMo,
    },
  },

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { resultsDir: config.allureResultsDir }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  projects: [
    // ── Desktop browsers ──────────────────────────────────────────────────
    {
      name: 'chromium',
      testMatch: [
        'tests/example-ui/**',
        'tests/example-accessibility/**',
        'tests/example-performance/**',
        'tests/telligen/**',
      ],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testMatch: ['tests/example-ui/**'],
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testMatch: ['tests/example-ui/**'],
      use: { ...devices['Desktop Safari'] },
    },

    // ── Mobile ────────────────────────────────────────────────────────────
    {
      name: 'mobile-chrome',
      testMatch: ['tests/example-ui/**'],
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      testMatch: ['tests/example-ui/**'],
      use: { ...devices['iPhone 13'] },
    },

    // ── Tablet ────────────────────────────────────────────────────────────
    {
      name: 'tablet',
      testMatch: ['tests/example-ui/**'],
      use: { ...devices['iPad Pro'] },
    },

    // ── API (no browser needed) ───────────────────────────────────────────
    {
      name: 'api',
      testMatch: ['tests/example-api/**'],
    },

    // ── Telligen mobile ───────────────────────────────────────────────────
    {
      name: 'telligen-mobile',
      testMatch: ['tests/telligen/**'],
      use: { ...devices['iPhone 13'] },
    },
  ],
});
