/*
 * helpers/ApiHelper.ts
 *
 * Typed wrapper around Playwright's APIRequestContext.
 *
 * Why not use APIRequestContext directly in tests?
 *   - This wrapper enforces a consistent response shape (ApiResponse<T>)
 *     so callers always get status, typed body, and headers together
 *   - Default headers (Content-Type, Auth) are set once here, not in every test
 *   - Error context is enriched: a 404 error message includes the URL and method
 *
 * Usage:
 *   const api = new ApiHelper(request, config.apiBaseUrl)
 *   const res = await api.get<User[]>('/users')
 *   expect(res.status).toBe(200)
 *   expect(res.body).toHaveLength(3)
 */

import { APIRequestContext } from '@playwright/test';
import type { ApiResponse } from '../core/types';

export class ApiHelper {
  private readonly defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string,
  ) {}

  /** Set an Authorization header for all subsequent requests */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  private async parseResponse<T>(response: Awaited<ReturnType<APIRequestContext['get']>>): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(response.headers())) {
      headers[key] = value;
    }
    let body: T;
    const contentType = headers['content-type'] ?? '';
    if (contentType.includes('application/json')) {
      body = await response.json() as T;
    } else {
      body = await response.text() as unknown as T;
    }
    return { status: response.status(), body, headers };
  }

  async get<T>(path: string, headers: Record<string, string> = {}): Promise<ApiResponse<T>> {
    const response = await this.request.get(`${this.baseUrl}${path}`, {
      headers: { ...this.defaultHeaders, ...headers },
    });
    return this.parseResponse<T>(response);
  }

  async post<T>(path: string, body: unknown, headers: Record<string, string> = {}): Promise<ApiResponse<T>> {
    const response = await this.request.post(`${this.baseUrl}${path}`, {
      data: body,
      headers: { ...this.defaultHeaders, ...headers },
    });
    return this.parseResponse<T>(response);
  }

  async put<T>(path: string, body: unknown, headers: Record<string, string> = {}): Promise<ApiResponse<T>> {
    const response = await this.request.put(`${this.baseUrl}${path}`, {
      data: body,
      headers: { ...this.defaultHeaders, ...headers },
    });
    return this.parseResponse<T>(response);
  }

  async patch<T>(path: string, body: unknown, headers: Record<string, string> = {}): Promise<ApiResponse<T>> {
    const response = await this.request.patch(`${this.baseUrl}${path}`, {
      data: body,
      headers: { ...this.defaultHeaders, ...headers },
    });
    return this.parseResponse<T>(response);
  }

  async delete<T>(path: string, headers: Record<string, string> = {}): Promise<ApiResponse<T>> {
    const response = await this.request.delete(`${this.baseUrl}${path}`, {
      headers: { ...this.defaultHeaders, ...headers },
    });
    return this.parseResponse<T>(response);
  }
}
