/*
 * tests/telligen/navigation/nav-links.spec.ts
 *
 * Regression tests for Telligen site navigation.
 * Verifies all known internal links return 200, key pages have correct
 * titles, and Client Solutions section pages load without errors.
 *
 * Link-checking strategy:
 *   request.get() is used for bulk status checks — it sends a real HTTP
 *   request without a full browser render, making 40 checks fast.
 *   Full page.goto() is reserved for content assertions (title, heading).
 *
 * Tags: @regression @telligen @navigation
 */

import { test, expect } from '../../../fixtures/index';

const BASE_URL = 'https://www.telligen.com';

const NAV_LINKS = [
  { text: 'CLIENT SOLUTIONS', path: '/client-solutions/' },
  { text: 'Employers and Self-Funded Plans', path: '/client-solutions/employers-and-self-funded-plans/' },
  { text: 'At Risk and Diabetes Prevention', path: '/client-solutions/employers-and-self-funded-plans/at-risk-and-diabetes-prevention/' },
  { text: 'Case Management Employers', path: '/client-solutions/employers-and-self-funded-plans/case-management/' },
  { text: 'Chronic Conditions', path: '/client-solutions/employers-and-self-funded-plans/chronic-conditions/' },
  { text: 'Specialty Solutions', path: '/client-solutions/employers-and-self-funded-plans/specialty-solutions/' },
  { text: 'Utilization Management Employers', path: '/client-solutions/employers-and-self-funded-plans/utilization-management-hwb/' },
  { text: 'Wellness Solutions', path: '/client-solutions/employers-and-self-funded-plans/wellness-solutions/' },
  { text: 'Federal', path: '/client-solutions/federal/' },
  { text: 'Data Analytics and Validation', path: '/client-solutions/federal/data-analytics-and-validation/' },
  { text: 'Learning and Dissemination', path: '/client-solutions/federal/learning-and-dissemination/' },
  { text: 'Quality Improvement Federal', path: '/client-solutions/federal/quality-improvement/' },
  { text: 'Quality Measurement Federal', path: '/client-solutions/federal/quality-measurement/' },
  { text: 'Software Development', path: '/client-solutions/federal/software-development/' },
  { text: 'State', path: '/client-solutions/state/' },
  { text: 'Assessments State', path: '/client-solutions/state/assessments/' },
  { text: 'Care Management State', path: '/client-solutions/state/care-management/' },
  { text: 'Quality and Performance Improvement', path: '/client-solutions/state/state-quality-and-performance-improvement/' },
  { text: 'Quality Measurement and Reporting', path: '/client-solutions/state/quality-measurement-and-reporting/' },
  { text: 'Utilization Management State', path: '/client-solutions/state/utilization-management/' },
  { text: 'Health Plans', path: '/client-solutions/health-plans/' },
  { text: 'Assessments Health Plans', path: '/client-solutions/health-plans/assessments-health-plans/' },
  { text: 'Case Management Health Plans', path: '/client-solutions/health-plans/case-management-health-plans/' },
  { text: 'Value-Based Reimbursement Models', path: '/client-solutions/health-plans/value-based-reimbursement-models/' },
  { text: 'Utilization Management Health Plans', path: '/client-solutions/health-plans/utilization-management-health-plans/' },
  { text: 'NDPP Coaching', path: '/client-solutions/ndpp-coaching/' },
  { text: 'Curriculum', path: '/client-solutions/ndpp-coaching/curriculum/' },
  { text: 'Delivery', path: '/client-solutions/ndpp-coaching/delivery/' },
  { text: 'More Information', path: '/client-solutions/ndpp-coaching/more-information/' },
  { text: 'Registration', path: '/client-solutions/ndpp-coaching/registration/' },
  { text: 'Qualitrac', path: '/client-solutions/qualitrac/' },
  { text: 'Case Management Module', path: '/client-solutions/qualitrac/case-management-module/' },
  { text: 'Quality Measurement Reporting Module', path: '/client-solutions/qualitrac/quality-measurement-reporting-module/' },
  { text: 'Utilization Management Module', path: '/client-solutions/qualitrac/utilization-management-module/' },
  { text: 'PASRR Module', path: '/client-solutions/qualitrac/pasrr-module/' },
  { text: 'Health Equity', path: '/health-equity/' },
  { text: 'About Us', path: '/about-us/' },
  { text: 'Locations', path: '/locations/' },
  { text: 'Other Programs', path: '/other-programs/' },
  { text: 'News', path: '/news/' },
];

// Top-level Client Solutions sections only — sub-pages are covered by the link-status test
const CLIENT_SOLUTIONS_TOP_LEVEL = [
  '/client-solutions/',
  '/client-solutions/employers-and-self-funded-plans/',
  '/client-solutions/federal/',
  '/client-solutions/state/',
  '/client-solutions/health-plans/',
  '/client-solutions/qualitrac/',
];

const BATCH_SIZE = 5;

test.describe('Navigation Links @regression @telligen @navigation', () => {

  test('all navigation links return 200 status', async ({ request }) => {
    test.setTimeout(120000); // 2 minutes — 40 links in batches of 5

    const failures: string[] = [];

    await test.step(`check ${NAV_LINKS.length} navigation links in batches of ${BATCH_SIZE}`, async () => {
      for (let i = 0; i < NAV_LINKS.length; i += BATCH_SIZE) {
        const batch = NAV_LINKS.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(
          batch.map(async (link) => {
            try {
              const response = await request.get(BASE_URL + link.path);
              return { link, status: response.status(), ok: response.status() === 200 };
            } catch {
              return { link, status: 0, ok: false };
            }
          }),
        );
        results.filter(r => !r.ok).forEach(r =>
          failures.push(`${r.link.text} → ${r.link.path} (${r.status})`),
        );
      }
    });

    await test.step('assert no links failed', async () => {
      if (failures.length > 0) {
        console.log('Failed links:');
        failures.forEach(f => console.log('  ❌ ' + f));
      }
      expect(failures, `These links did not return 200: ${failures.join(', ')}`).toHaveLength(0);
    });
  });

  test('key pages have correct titles', async ({ page }) => {
    const pagesToCheck = [
      { path: '/about-us/', titleContains: 'About' },
      { path: '/health-equity/', titleContains: 'Health' },
      { path: '/client-solutions/', titleContains: 'Telligen' },
      { path: '/news/', titleContains: 'News' },
      { path: '/locations/', titleContains: 'Locations' },
    ];

    for (const { path, titleContains } of pagesToCheck) {
      await test.step(`navigate to ${path} and assert title contains "${titleContains}"`, async () => {
        await page.goto(`${BASE_URL}${path}`);
        const title = await page.title();
        expect(title, `Page ${path} title "${title}" should contain "${titleContains}"`).toContain(titleContains);
      });
    }
  });

  test('client solutions section pages load without errors', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes — 6 full browser navigations

    const failures: string[] = [];

    for (const path of CLIENT_SOLUTIONS_TOP_LEVEL) {
      await test.step(`load ${path}`, async () => {
        try {
          const response = await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });

          if (response?.status() !== 200) {
            failures.push(`${path} — HTTP ${response?.status()}`);
            return;
          }

          const bodyText = (await page.locator('body').innerText()).toLowerCase();
          if (bodyText.includes('page not found') || bodyText.includes('404')) {
            failures.push(`${path} — 404 text found in body`);
            return;
          }

          const h1Count = await page.locator('h1').count();
          if (h1Count === 0) {
            failures.push(`${path} — no h1 heading found`);
          }
        } catch (e) {
          failures.push(`${path} — exception: ${(e as Error).message}`);
        }
      });
    }

    await test.step('assert all client solutions pages loaded correctly', async () => {
      if (failures.length > 0) {
        throw new Error(`${failures.length} page(s) failed content checks:\n${failures.join('\n')}`);
      }
      expect(failures).toHaveLength(0);
    });
  });
});
