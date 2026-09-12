/*
 * tests/telligen/smoke/homepage.spec.ts
 *
 * Smoke tests for the Telligen homepage.
 * Smoke = fast, high-signal tests that confirm the site is alive and the
 * primary navigation is intact. Run on every deploy before regression suite.
 *
 * Tags: @smoke @telligen
 */

import { test, expect } from '../../../fixtures/index';
import { HomePage } from '../../../pages/telligen/HomePage';

test.describe('Telligen Homepage @smoke @telligen', () => {

  test('homepage loads with correct title', async ({ page, config }) => {
    const home = new HomePage(page, config.baseUrl);

    await test.step('navigate to homepage', async () => {
      await home.navigate();
    });

    await test.step('assert title contains Telligen', async () => {
      const title = await home.getTitle();
      expect(title).toContain('Telligen');
    });
  });

  test('main navigation is visible', async ({ page, config }) => {
    const home = new HomePage(page, config.baseUrl);

    await test.step('navigate to homepage', async () => {
      await home.navigate();
      await home.dismissCookieBanner();
    });

    // These are the primary nav items Telligen exposes at the top level
    const expectedItems = ['CLIENT SOLUTIONS', 'Health Equity', 'About Us', 'News', 'Careers'];

    for (const item of expectedItems) {
      await test.step(`assert "${item}" is visible in nav`, async () => {
        const visible = await home.isNavItemVisible(item);
        expect(visible, `Expected nav item "${item}" to be visible`).toBe(true);
      });
    }
  });

  test('homepage has main heading', async ({ page, config }) => {
    const home = new HomePage(page, config.baseUrl);

    await test.step('navigate to homepage', async () => {
      await home.navigate();
      await home.dismissCookieBanner();
    });

    await test.step('assert h1 exists and has text content', async () => {
      const heading = await home.getPageHeading();
      expect(heading.length, 'Expected h1 to have non-empty text').toBeGreaterThan(0);
    });
  });

  test('cookie banner handled gracefully', async ({ page, config }) => {
    const home = new HomePage(page, config.baseUrl);

    await test.step('navigate to homepage', async () => {
      await home.navigate();
    });

    await test.step('dismiss cookie banner if present', async () => {
      // dismissCookieBanner is a no-op if no banner appears — test must not fail
      await home.dismissCookieBanner();
    });

    await test.step('assert page body is visible', async () => {
      await expect(page.locator('body')).toBeVisible();
    });
  });
});
