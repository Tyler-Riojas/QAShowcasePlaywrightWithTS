# Playwright TypeScript Template — Restaurant Analogy

## The Big Picture
The Template = A Restaurant Franchise System
You = The Franchise Owner
Tests = The Dishes Being Served
Target Website/App = The Customers Being Served

---

## The Building — playwright.config.ts
The restaurant building itself.
Defines:
- How many chefs work at once (workers: 4)
- How long before an order is abandoned (timeout: 30000)
- Which kitchen stations are open (projects: chromium, firefox, webkit)
- Whether the dining room lights are on (headless: true/false)
- What to do when a dish fails (retries, screenshots, traces)

You don't change this every day.
It's the infrastructure everything else runs inside.

---

## The Franchise Manual — .env + core/config.ts
The operations manual every franchise location follows.

.env = the local manager's settings for THIS location
- BASE_URL = which neighborhood are we serving
- HEADLESS = is the dining room open to watch
- WORKERS  = how many chefs are on shift

core/config.ts = translates the manual into rules
- Reads .env
- Sets defaults if something is missing
- Makes settings available to the whole kitchen

New franchise location (new target app):
  Change .env → point at new URL
  Everything else stays the same

---

## The Kitchen Stations — projects in Config
Each project is a separate kitchen station:

| Station | What It Serves |
|---------|---------------|
| chromium | Chrome dishes only |
| firefox | Firefox dishes only |
| webkit | Safari dishes only |
| mobile-chrome | Pixel 5 sized plates |
| mobile-safari | iPhone 13 sized plates |
| tablet | iPad sized plates |
| api | Takeout only, no dining room needed |

Run one station:  npm run test:chromium
Run all stations: npm run test:all-browsers

---

## The Chef Uniform — fixtures/base.fixture.ts
Every chef wears the same uniform — standard equipment included.
The base fixture is the uniform.

What every chef (test) gets automatically:
- A browser page (the kitchen counter to work on)
- The config (the recipe book)
- Auto-screenshot if they drop the dish (failure screenshot)
- Allure labels already attached (name tag on every dish)

You don't set this up in every test.
It's already there when the test starts.

---

## The Specialist Uniform — fixtures/auth.fixture.ts
Some chefs work in the members-only section.
They need a special keycard (auth token).

The auth fixture is that keycard:
- Gets the token once before service starts
- Passes it to every test that needs it
- Tests that don't need auth don't get the keycard

Without fixture: every chef asks for a keycard every dish
With fixture:    keycard handed out once at start of shift

---

## The Recipe Template — pages/BasePage.ts
The standard recipe format every dish follows.
Abstract = you cannot order a BasePage directly
           you order LoginPage, DashboardPage etc
           but they all follow the same format

Every recipe (page object) inherits:
- navigate()        = go to this section of the restaurant
- waitForLoad()     = wait for kitchen to be ready
- screenshot()      = photograph the dish
- assertTitle()     = check the dish name is correct
- assertVisible()   = check the garnish is present
- scrollToElement() = find the ingredient on the menu

Adding a new page object:
  1. extend BasePage
  2. define get path()
  3. add your specific methods
  4. Done — everything else inherited

---

## The Specific Recipes — Page Objects
LoginPage extends BasePage
= the appetizer recipe
  Inherits: navigate, wait, assert
  Adds:     login(), assertLoginError()

DashboardPage extends BasePage
= the main course recipe
  Inherits: navigate, wait, assert
  Adds:     navigateToPayments(), getBalance()

Each page object = one section of the menu
Each method      = one step in the recipe

---

## The Kitchen Tools — utils/

### WaitUtils.ts = The Kitchen Timer
- waitForNetworkIdle()  = wait for oven to stop beeping
- waitForText()         = wait for cheese to melt
- waitForCondition()    = wait until the soufflé rises

### ScreenshotUtils.ts = The Food Photographer
- capture()             = photograph any dish
- captureElement()      = photograph one ingredient
- captureFullPage()     = photograph the whole spread

### AccessibilityUtils.ts = The Health Inspector
- runAudit()            = full inspection
- assertNoViolations()  = must pass inspection to serve

### PerformanceUtils.ts = The Speed Timer
- assertFCP()           = first plate out within X seconds
- assertTTFB()          = kitchen acknowledged order in X seconds
- assertLCP()           = biggest dish plated within X seconds

### ReportUtils.ts = The Food Critic's Notepad
- step()                = what happened at each stage
- severity()            = how bad is it if this fails
- label()               = tag this dish for the report

---

## The Ingredients — helpers/factories.ts
The prep kitchen — generates fresh ingredients.
Never reuses old ingredients (no hardcoded IDs).

- generateEmail()   = fresh unique email every time
- generateAmount()  = random integer amount (never float)
- generateName()    = unique customer name
- generatePayload() = full order with all ingredients

Why unique every time:
  Two chefs cannot use the same ingredient
  Tests run in parallel — they would collide
  randomUUID() guarantees freshness

---

## The Delivery Service — helpers/ApiHelper.ts
The takeout/delivery operation.
No dining room needed — pure food delivery.

- get()    = check the menu (GET request)
- post()   = place an order (POST request)
- put()    = replace an order (PUT request)
- patch()  = modify an order (PATCH request)
- delete() = cancel an order (DELETE request)

ApiResponse<T> = the delivery receipt
- status:  was it delivered successfully
- body:    what was delivered
- headers: delivery metadata

---

## The Health Grades — Reporting

### Playwright HTML Report = Daily Inspection Report
- Pass/fail for every dish served today
- Photos of any dishes that failed
- How long each dish took to prepare
- Open with: npm run report:html

### Allure Report = Michelin Star Evaluation
- Trends over time — are we getting better?
- Breakdown by feature area
- Step by step what happened with each dish
- Open with: npm run report:allure

### GitHub Pages = Public Health Grade On The Door
- Anyone can see it without visiting the kitchen
- Updates automatically after every CI run

---

## The Staff Schedule — CI/CD
.github/workflows/ci.yml = the weekly staff schedule

Four stations run simultaneously:
- Chef A: Chrome kitchen    (test-chromium job)
- Chef B: Firefox kitchen   (test-firefox job)
- Chef C: Safari kitchen    (test-webkit job)
- Chef D: Delivery service  (test-api job)

All four work at the same time (parallel jobs)
Total service time = slowest single chef
Not the sum of all four

After service:
  Allure job collects all inspection reports
  Combines into one master report
  Posts publicly to GitHub Pages

---

## Franchise Expansion — Adding A New Target App

Old way (Selenium): rewrite the whole kitchen
New way (this template):

Step 1: Change .env
  BASE_URL=https://myapp.com

Step 2: Create page objects
  pages/LoginPage.ts extends BasePage
  pages/DashboardPage.ts extends BasePage

Step 3: Write tests
  import { test } from '../../fixtures/index'
  import { LoginPage } from '../../pages/LoginPage'

Step 4: Run
  npm run test:smoke

The entire kitchen infrastructure stays the same.
Only the recipes change.
That is the value of the template.

---

## The One-Sentence Summary
"The template is the franchise system —
 the kitchen, tools, uniforms, and standards.
 The page objects are the recipes.
 The tests are the dishes.
 You only build the kitchen once.
 After that you just write recipes."

---

## Quick Reference — Run Commands

| Command | What It Does |
|---------|-------------|
| npm run test:smoke | Run @smoke tests on default browser |
| npm run test:chromium | Chrome only |
| npm run test:firefox | Firefox only |
| npm run test:webkit | Safari only |
| npm run test:all-browsers | All three desktop browsers |
| npm run test:mobile | Pixel 5 + iPhone 13 |
| npm run test:api | API tests only (no browser) |
| npm run test:headed | Watch the browser |
| npm run test:debug | Playwright inspector |
| npm run report:html | Open HTML report |
| npm run report:allure | Open Allure report |
| npm run clean | Clear all results |
