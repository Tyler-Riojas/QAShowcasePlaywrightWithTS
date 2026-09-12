/*
 * helpers/factories.ts
 *
 * Generic test data factories. These functions produce unique, valid values
 * on every call so tests don't collide when run in parallel.
 *
 * Design rules:
 *   - All IDs use crypto.randomUUID() — CSPRNG-backed, no collisions at scale
 *   - All amounts are integers — IEEE 754 float arithmetic is unsafe for money
 *   - All dates are ISO 8601 strings — unambiguous across timezones
 *   - generatePayload<T> uses a generic merge — keeps tests DRY when only
 *     one field differs from a valid base payload
 */

import { randomUUID } from 'crypto';

/** Generates a short unique ID (8 chars from UUID — 2^32 combinations) */
export function generateUniqueId(): string {
  return randomUUID().replace(/-/g, '').slice(0, 8);
}

/**
 * Generates a unique email address safe for use in any test environment.
 * The timestamp suffix prevents clashes when the same test re-runs quickly.
 */
export function generateEmail(prefix: string = 'test'): string {
  const id = generateUniqueId();
  return `${prefix}_${id}_${Date.now()}@test.example.com`;
}

/** Generates a unique display name (firstname + unique suffix) */
export function generateName(): string {
  const id = generateUniqueId();
  return `TestUser_${id}`;
}

/**
 * Generates a random integer amount within the given range.
 * Uses Math.floor to guarantee an integer — never a float.
 * Default range 1–9999 represents $0.01–$99.99 in cent representation.
 */
export function generateAmount(min: number = 1, max: number = 9999): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates an ISO 8601 date string relative to today.
 *   generateDate(0)   → today
 *   generateDate(7)   → 7 days from now
 *   generateDate(-1)  → yesterday
 */
export function generateDate(daysFromNow: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0]!;
}

/**
 * Merges overrides onto a base payload, producing a new object.
 * Useful for boundary tests that only need to vary one field:
 *   const payload = generatePayload(createBookingPayload(), { totalprice: 0 })
 */
export function generatePayload<T extends object>(base: T, overrides?: Partial<T>): T {
  return { ...base, ...overrides };
}
