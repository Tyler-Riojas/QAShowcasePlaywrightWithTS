/*
 * fixtures/auth.fixture.ts
 *
 * Extends the base fixture with authentication capabilities.
 * Supports both token-based auth (API header) and session-based auth
 * (browser cookie / localStorage). If no credentials are configured the
 * fixtures resolve gracefully with empty values so unauthenticated tests
 * still run without errors.
 *
 * Usage in tests:
 *   import { authenticatedTest } from '@fixtures/index'
 *   authenticatedTest('my test', async ({ authenticatedPage, authHeaders }) => { ... })
 */

import { Page, APIRequestContext } from '@playwright/test';
import { test as base } from './base.fixture';
import config from '../core/config';

export interface AuthFixtures {
  /** Raw bearer token — may be empty if no credentials configured */
  token: string;
  /** HTTP headers with Authorization and Content-Type set */
  authHeaders: { Authorization: string; 'Content-Type': string };
  /** Page instance with auth session already established */
  authenticatedPage: Page;
}

export const authenticatedTest = base.extend<AuthFixtures>({
  /*
   * Obtains a session token. Strategy:
   *   1. If AUTH_TOKEN is set in env, use it directly (CI / pre-issued token)
   *   2. If TEST_USERNAME + TEST_PASSWORD are set, POST to /auth endpoint
   *   3. Otherwise resolve with empty string — unauthenticated tests still run
   */
  token: async ({ request }: { request: APIRequestContext }, use: (t: string) => Promise<void>) => {
    if (config.authToken) {
      await use(config.authToken);
      return;
    }

    if (config.username && config.password) {
      const apiBase = config.apiBaseUrl || config.baseUrl;
      const response = await request.post(`${apiBase}/auth`, {
        data: { username: config.username, password: config.password },
      });
      if (response.ok()) {
        const body = await response.json() as { token?: string };
        await use(body.token ?? '');
        return;
      }
    }

    // No credentials configured — resolve with empty token
    await use('');
  },

  /*
   * Builds standard HTTP auth headers from the resolved token.
   * Tests that need to call authenticated API endpoints use this directly
   * rather than constructing headers manually.
   */
  authHeaders: async ({ token }: { token: string }, use: (h: { Authorization: string; 'Content-Type': string }) => Promise<void>) => {
    await use({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  },

  /*
   * Page with an active auth session. Injects the token into localStorage
   * so subsequent page navigations are already authenticated.
   * Adapt the storage key to match your application's auth mechanism.
   */
  authenticatedPage: async ({ page, token }: { page: Page; token: string }, use: (p: Page) => Promise<void>) => {
    if (token) {
      await page.goto(config.baseUrl);
      // Store token in localStorage — change key to match your app's convention
      await page.evaluate((t: string) => {
        window.localStorage.setItem('auth_token', t);
      }, token);
    }
    await use(page);
  },
});
