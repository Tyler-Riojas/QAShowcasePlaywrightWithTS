# Telligen Automation Suite

Playwright TypeScript test suite for [www.telligen.com](https://www.telligen.com)
Built using the [Playwright TS Template Framework](https://github.com/Tyler-Riojas/playwright-ts-template)

---

## What This Tests

| Suite | Tests | Description |
|---|---|---|
| Smoke | 4 | Homepage load, main navigation, h1 heading, cookie banner handling |
| Navigation | 3 | 40-link HTTP status check, key page titles, Client Solutions content |
| Accessibility | 6 | WCAG 2.1 critical violations on 5 pages + mobile viewport |
| Performance | 4 | FCP and TTFB on Homepage, About Us, Client Solutions + mobile |

---

## Real Findings

These are actual defects found by this suite against the live site.

### Finding 1 — Qualitrac button image missing alt text

**Severity:** CRITICAL (axe-core) | **WCAG:** 1.1.1 Non-text Content (Level A)

```
Element:  <img class="buttonizer-image" ...>
Location: Site header — present on every page sitewide
Impact:   Screen readers cannot describe the floating action button
```

The Qualitrac button rendered in the site header uses an `<img>` with no `alt` attribute. Because it appears on every page, this is a sitewide violation rather than a page-specific one. Under Section 508 — which applies to federal contractors — this is a compliance failure.

---

### Finding 2 — URAC accreditation badges missing alt text

**Severity:** CRITICAL (axe-core) | **WCAG:** 1.1.1 Non-text Content (Level A)

```
Element:  3 × <img> in the accreditation section
Location: /about-us/
Badges:   Case Management · Disease Management · Health Utilization Management
Impact:   Screen readers cannot identify which accreditations Telligen holds
```

Telligen's own URAC compliance badges — the visual proof of their healthcare quality credentials — are themselves non-compliant. A screen reader user on the About Us page cannot determine what Telligen is accredited for. For a company with Section 508 obligations serving federal and state health programs, this is the highest-irony finding the accessibility suite can surface.

---

## Tech Stack

| Tool | Version | Role |
|---|---|---|
| Playwright | 1.63 | Browser automation + API testing |
| TypeScript | 7 (strict) | Type safety |
| axe-core | 4.x | Accessibility auditing |
| Node.js | 22 | Runtime |

---

## Quick Start

```bash
git clone <repo>
npm install
npx playwright install chromium

# Run smoke tests against www.telligen.com
npm run test:telligen:smoke
```

---

## Run Commands

| Command | What it runs |
|---|---|
| `npm run test:telligen` | All Telligen tests (chromium) |
| `npm run test:telligen:smoke` | Smoke suite — homepage, nav, heading |
| `npm run test:telligen:nav` | Navigation — 40 links, titles, content |
| `npm run test:telligen:a11y` | Accessibility — axe-core critical violations |
| `npm run test:telligen:perf` | Performance — FCP, TTFB thresholds |
| `npm run test:telligen:mobile` | All suites on iPhone 13 viewport |
| `npm run report:html` | Open Playwright HTML report |
| `npm run report:allure` | Serve Allure report live |

---

## Built On

This suite is an instance of the **Playwright TypeScript Template Framework** — a production-grade, configuration-driven template that can be pointed at any web application or API.

The template provides all shared infrastructure:

```
core/          — typed config from .env, shared interfaces
fixtures/      — base fixture (screenshot-on-fail), auth fixture
pages/         — BasePage abstract class
utils/         — WaitUtils, ScreenshotUtils, AccessibilityUtils, PerformanceUtils
helpers/       — ApiHelper, data factories
.github/       — parallel CI jobs + Allure GitHub Pages deploy
```

Template repository: [github.com/Tyler-Riojas/playwright-ts-template](https://github.com/Tyler-Riojas/playwright-ts-template) *(private)*
