/**
 * helpers.js — Shared Selenium utilities for IssueSphere E2E tests
 *
 * Provides:
 *  - Chrome WebDriver builder (headless-capable)
 *  - Common wait helpers
 *  - Login helpers for student & admin
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// ── Config ──────────────────────────────────────────────────────
const BASE_URL = process.env.APP_URL || 'http://localhost:5173';
const TIMEOUT  = 10000; // 10 seconds max wait

// ── Test credentials (match seed.js) ────────────────────────────
const TEST_USERS = {
  student: {
    email: 'alice@campus.com',
    password: 'Password@123',
    name: 'Alice Student',
  },
  admin: {
    email: 'admin@campus.com',
    password: 'Admin@123',
    adminKey: 'admin123',
    name: 'Admin User',
  },
};

// ── Build a Chrome WebDriver ────────────────────────────────────
function buildDriver() {
  const options = new chrome.Options();

  // Run headless in CI (set HEADLESS=true), headed locally by default
  if (process.env.HEADLESS === 'true') {
    options.addArguments('--headless=new');
  }
  options.addArguments('--no-sandbox', '--disable-dev-shm-usage', '--window-size=1920,1080');

  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
}

// ── Helpers ─────────────────────────────────────────────────────

/** Wait for an element with the given CSS selector to be present and visible */
async function waitFor(driver, css, timeout = TIMEOUT) {
  const el = await driver.wait(until.elementLocated(By.css(css)), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  return el;
}

/** Wait for an element with [data-testid="..."] */
async function waitForTestId(driver, testId, timeout = TIMEOUT) {
  return waitFor(driver, `[data-testid="${testId}"]`, timeout);
}

/** Clear an input and type new value */
async function clearAndType(driver, element, text) {
  await element.clear();
  await element.sendKeys(text);
}

/** Login as student — ends on /dashboard */
async function loginAsStudent(driver) {
  await driver.get(`${BASE_URL}/auth`);

  // Ensure student tab is active (it's the default)
  await waitForTestId(driver, 'tab-student');

  // Fill in credentials using the name attribute (reliable for form inputs)
  const emailInput = await waitFor(driver, 'input[name="email"]');
  await clearAndType(driver, emailInput, TEST_USERS.student.email);

  const passInput = await waitFor(driver, 'input[name="password"]');
  await clearAndType(driver, passInput, TEST_USERS.student.password);

  // Submit
  const btn = await waitForTestId(driver, 'student-login-btn');
  await btn.click();

  // Wait for dashboard to load
  await waitForTestId(driver, 'dashboard-title');
}

/** Login as admin — ends on /admin/dashboard */
async function loginAsAdmin(driver) {
  await driver.get(`${BASE_URL}/auth`);

  // Switch to admin tab
  const adminTab = await waitForTestId(driver, 'tab-admin');
  await adminTab.click();

  // Fill in credentials
  const emailInput = await waitFor(driver, 'input[name="email"]');
  await clearAndType(driver, emailInput, TEST_USERS.admin.email);

  const passInput = await waitFor(driver, 'input[name="password"]');
  await clearAndType(driver, passInput, TEST_USERS.admin.password);

  const keyInput = await waitFor(driver, 'input[name="adminKey"]');
  await clearAndType(driver, keyInput, TEST_USERS.admin.adminKey);

  // Submit
  const btn = await waitForTestId(driver, 'admin-login-btn');
  await btn.click();

  // Wait for admin dashboard to load
  await waitForTestId(driver, 'admin-dashboard-title');
}

/** Logout (works from any dashboard page) */
async function logout(driver) {
  const btn = await waitForTestId(driver, 'logout-btn');
  await btn.click();
  // Wait for auth page to load
  await waitForTestId(driver, 'tab-student');
}

// ── Simple test result logger ───────────────────────────────────
function logPass(testName) {
  console.log(`  ✅ PASS: ${testName}`);
}
function logFail(testName, error) {
  console.error(`  ❌ FAIL: ${testName}`);
  console.error(`          ${error.message}`);
}

module.exports = {
  BASE_URL,
  TIMEOUT,
  TEST_USERS,
  buildDriver,
  waitFor,
  waitForTestId,
  clearAndType,
  loginAsStudent,
  loginAsAdmin,
  logout,
  logPass,
  logFail,
};
