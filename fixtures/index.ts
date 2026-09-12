/*
 * fixtures/index.ts
 *
 * Single import point for all fixtures.
 * Tests import from here rather than individual fixture files,
 * so internal reorganisation doesn't break test imports.
 *
 *   import { test, expect } from '@fixtures/index'
 *   import { authenticatedTest } from '@fixtures/index'
 */

export { test, expect } from './base.fixture';
export type { BaseFixtures } from './base.fixture';
export { authenticatedTest } from './auth.fixture';
export type { AuthFixtures } from './auth.fixture';
