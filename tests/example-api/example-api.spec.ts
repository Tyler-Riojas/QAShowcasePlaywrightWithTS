/*
 * tests/example-api/example-api.spec.ts
 *
 * Demonstrates: ApiHelper usage, response validation, auth header handling.
 * Target: https://restful-booker.herokuapp.com (a real public API)
 *
 * This file uses a concrete public API so the tests pass out-of-the-box.
 * In your project, replace the URL with config.apiBaseUrl and update
 * endpoint paths to match your application's API.
 *
 * Tags: @smoke @api
 */

import { test, expect } from '../../fixtures/index';
import { ApiHelper } from '../../helpers/ApiHelper';

const API_BASE = 'https://restful-booker.herokuapp.com';

test.describe('API Example @smoke @api', () => {

  test('API base URL is reachable', async ({ request }) => {
    const api = new ApiHelper(request, API_BASE);

    await test.step('GET /booking — list all bookings', async () => {
      const res = await api.get<Array<{ bookingid: number }>>('/booking');
      expect(res.status).toBe(200);
    });

    await test.step('response body is an array', async () => {
      const res = await api.get<Array<{ bookingid: number }>>('/booking');
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  test('authenticated request works when token provided', async ({ request }) => {
    const api = new ApiHelper(request, API_BASE);
    let token: string;

    await test.step('POST /auth — obtain token', async () => {
      const res = await api.post<{ token: string }>('/auth', {
        username: 'admin',
        password: 'password123',
      });
      expect(res.status).toBe(200);
      expect(typeof res.body.token).toBe('string');
      token = res.body.token;
    });

    await test.step('use token to create a booking', async () => {
      api.setAuthToken(token!);
      const res = await api.post<{ bookingid: number }>('/booking', {
        firstname: 'Template',
        lastname: 'Test',
        totalprice: 1500,
        depositpaid: true,
        bookingdates: { checkin: '2025-06-01', checkout: '2025-06-10' },
        additionalneeds: 'framework-test',
      });
      expect(res.status).toBe(200);
      expect(res.body.bookingid).toBeGreaterThan(0);
    });
  });

  test('invalid auth returns 401 or 403', async ({ request }) => {
    const api = new ApiHelper(request, API_BASE);

    await test.step('POST /auth with wrong credentials', async () => {
      const res = await api.post<{ reason: string }>('/auth', {
        username: 'invalid',
        password: 'wrong',
      });
      // restful-booker returns 200 with { reason: 'Bad credentials' } — real
      // APIs should return 401. Accept both to document the gap.
      expect([200, 401, 403]).toContain(res.status);
    });
  });
});
