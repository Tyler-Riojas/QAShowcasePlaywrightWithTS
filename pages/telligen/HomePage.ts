/*
 * pages/telligen/HomePage.ts
 *
 * Page object for the Telligen homepage (/).
 * Encapsulates homepage-specific interactions so tests stay readable
 * and selector changes only need one fix.
 */

import { BasePage } from '../BasePage';

export class HomePage extends BasePage {
  get path() { return '/'; }

  /**
   * Dismisses the cookie consent banner if one is present.
   * Wrapped in try/catch because the banner is not guaranteed on every
   * visit — caching, GeoIP rules, or prior consent may suppress it.
   */
  async dismissCookieBanner(): Promise<void> {
    try {
      const banner = this.page.locator(
        'button:has-text("Accept"), button:has-text("Got it"), button:has-text("OK"), ' +
        'button:has-text("Accept All"), button:has-text("Accept Cookies"), ' +
        '[id*="cookie"] button, [class*="cookie"] button, [class*="consent"] button',
      ).first();
      await banner.click({ timeout: 4000 });
    } catch {
      // No cookie banner visible — proceed normally
    }
  }

  /**
   * Returns the visible text of all navigation items across all nav elements.
   * Deduplicates so repeated items (e.g. mobile + desktop nav) appear once.
   */
  async getNavItems(): Promise<string[]> {
    const items = await this.page.locator('nav a').allTextContents();
    const seen = new Set<string>();
    return items.map(t => t.trim()).filter(t => {
      if (!t || seen.has(t)) return false;
      seen.add(t);
      return true;
    });
  }

  /**
   * Returns true if a nav item with the given text is present in the nav DOM.
   * Uses count() rather than isVisible() because dropdown items are hidden
   * until hovered — they exist in the DOM but have display:none until interaction.
   */
  async isNavItemVisible(text: string): Promise<boolean> {
    const count = await this.page.locator(`nav a:has-text("${text}")`).count();
    return count > 0;
  }

  /** Returns the text content of the first h1 on the page */
  async getPageHeading(): Promise<string> {
    return (await this.page.locator('h1').first().textContent() ?? '').trim();
  }
}
