/**
 * Test 1: Student Login Flow
 *
 * Steps:
 *  1. Navigate to /auth
 *  2. Enter student credentials (alice@campus.com / Password@123)
 *  3. Click Sign In
 *  4. Verify redirect to /dashboard
 *  5. Verify dashboard title is visible
 *  6. Verify at least one complaint card is displayed
 *  7. Logout and verify redirect back to /auth
 */

const { By } = require('selenium-webdriver');
const {
  buildDriver,
  loginAsStudent,
  logout,
  waitForTestId,
  waitFor,
  logPass,
  logFail,
} = require('../helpers');

async function runStudentLoginTest() {
  console.log('\n🧪 TEST SUITE: Student Login Flow');
  console.log('─'.repeat(40));

  const driver = await buildDriver();
  let passed = 0;
  let failed = 0;

  try {
    // ── Test 1.1: Login and land on dashboard ──────────────────
    try {
      await loginAsStudent(driver);
      const url = await driver.getCurrentUrl();
      if (!url.includes('/dashboard')) {
        throw new Error(`Expected /dashboard, got ${url}`);
      }
      logPass('Student login redirects to /dashboard');
      passed++;
    } catch (e) {
      logFail('Student login redirects to /dashboard', e);
      failed++;
    }

    // ── Test 1.2: Dashboard title is visible ───────────────────
    try {
      const title = await waitForTestId(driver, 'dashboard-title');
      const text = await title.getText();
      if (!text.includes('Dashboard')) {
        throw new Error(`Expected "Dashboard", got "${text}"`);
      }
      logPass('Dashboard title is displayed');
      passed++;
    } catch (e) {
      logFail('Dashboard title is displayed', e);
      failed++;
    }

    // ── Test 1.3: Complaint cards are loaded ───────────────────
    try {
      // Wait a moment for complaints to load from API
      await driver.sleep(2000);
      const cards = await driver.findElements(By.css('[data-testid="complaint-card"]'));
      if (cards.length === 0) {
        throw new Error('No complaint cards found on dashboard');
      }
      logPass(`Complaint cards loaded (${cards.length} found)`);
      passed++;
    } catch (e) {
      logFail('Complaint cards loaded', e);
      failed++;
    }

    // ── Test 1.4: Logout works ─────────────────────────────────
    try {
      await logout(driver);
      const url = await driver.getCurrentUrl();
      if (!url.includes('/auth')) {
        throw new Error(`Expected /auth after logout, got ${url}`);
      }
      logPass('Logout redirects to /auth');
      passed++;
    } catch (e) {
      logFail('Logout redirects to /auth', e);
      failed++;
    }

  } finally {
    await driver.quit();
  }

  console.log(`\n  Results: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

// Run if executed directly
if (require.main === module) {
  runStudentLoginTest().then(success => process.exit(success ? 0 : 1));
}

module.exports = { runStudentLoginTest };
