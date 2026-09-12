/*
 * pages/telligen/NavigationPage.ts
 *
 * Page object for navigation link discovery and status checking.
 * Used by the navigation regression suite to verify all internal links
 * return 200 without needing a full browser load per URL.
 */

import { BasePage } from '../BasePage';

export class NavigationPage extends BasePage {
  get path() { return '/'; }

  /**
   * Performs a lightweight HEAD/GET request for the given URL and returns
   * the HTTP status code. Does not load the page in the browser — faster
   * for bulk link checking (40+ URLs) than full page.goto() per link.
   */
  async checkLinkStatus(url: string): Promise<number> {
    const response = await this.page.request.get(url, {
      // Follow redirects so 301/302 chains resolve to their final status
      maxRedirects: 5,
    });
    return response.status();
  }

  /**
   * Queries all anchor elements within nav/header elements and returns
   * their text and href attributes. Filters out anchors with no href or
   * href="#" (in-page anchors that don't represent real navigation).
   */
  async getAllNavLinks(): Promise<Array<{ text: string; href: string }>> {
    return this.page.evaluate(() => {
      const selectors = ['nav a', 'header a', '[role="navigation"] a'];
      const anchors = selectors.flatMap(sel => Array.from(document.querySelectorAll(sel)));

      const seen = new Set<string>();
      const links: Array<{ text: string; href: string }> = [];

      for (const a of anchors) {
        const href = (a as HTMLAnchorElement).href;
        const text = (a.textContent ?? '').trim();
        if (!href || href.endsWith('#') || seen.has(href)) continue;
        seen.add(href);
        links.push({ text, href });
      }

      return links;
    });
  }
}
