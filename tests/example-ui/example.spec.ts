/*
 * tests/example-ui/example.spec.ts
 *
 * Demonstrates: BasePage usage, base fixture, viewport assertions, screenshots.
 * Target: whatever BASE_URL is configured in .env (defaults to https://example.com)
 *
 * Replace these with your application's actual page objects and assertions.
 * These tests are intentionally generic — they prove the framework wires up
 * correctly against any URL, not that a specific application works.
 *
 * Tags: @smoke
 */

import { test, expect } from '../../fixtures/index';
import { BasePage } from '../../pages/BasePage';
import { ScreenshotUtils } from '../../utils/ScreenshotUtils';

// Minimal concrete page object for the example target
class ExamplePage extends BasePage {
  get path() { return '/'; }
}

test.describe('UI Example @smoke', () => {

  test('page loads and has a title', async ({ page, config }) => {
    const examplePage = new ExamplePage(page, config.baseUrl);

    await test.step('navigate to base URL', async () => {
      await examplePage.navigate();
    });

    await test.step('assert page has a non-empty title', async () => {
      const title = await examplePage.getTitle();
      expect(title.length).toBeGreaterThan(0);
    });

    await test.step('assert URL matches base URL', async () => {
      const url = await examplePage.getCurrentUrl();
      expect(url).toContain(config.baseUrl.replace(/https?:\/\//, ''));
    });
  });

  test('navigation works', async ({ page, config }) => {
    const examplePage = new ExamplePage(page, config.baseUrl);

    await test.step('navigate to page', async () => {
      await examplePage.navigate();
    });

    await test.step('reload and confirm page is still loaded', async () => {
      await examplePage.reload();
      const url = await examplePage.getCurrentUrl();
      expect(url).toBeTruthy();
    });
  });

  test('page is responsive on mobile viewport', async ({ page, config }) => {
    await test.step('set mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 812 });
    });

    await test.step('navigate and confirm page renders', async () => {
      await page.goto(config.baseUrl);
      await expect(page).toHaveURL(/.+/);
    });

    await test.step('reset to desktop viewport', async () => {
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });

  test('screenshot captured correctly', async ({ page, config }) => {
    const examplePage = new ExamplePage(page, config.baseUrl);

    await test.step('navigate to page', async () => {
      await examplePage.navigate();
    });

    await test.step('capture screenshot and verify file was created', async () => {
      const filePath = await ScreenshotUtils.capture(page, 'example-ui-test');
      // The path is returned — in a real test you might attach it to the Allure report
      expect(filePath).toContain('.png');
    });
  });
});
