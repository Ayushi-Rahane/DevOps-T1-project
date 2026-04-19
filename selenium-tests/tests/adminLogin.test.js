/**
 * Test 3: Admin Login & Dashboard Visibility
 *
 * Steps:
 *  1. Navigate to /auth
 *  2. Switch to Administrator tab
 *  3. Enter admin credentials (admin@campus.com / Admin@123 / admin123)
 *  4. Verify redirect to /admin/dashboard
 *  5. Verify admin dashboard title is visible
 *  6. Verify complaint stats are displayed
 *  7. Verify complaint cards are loaded
 *  8. Logout
 */

const { By } = require('selenium-webdriver');
const {
  buildDriver,
  loginAsAdmin,
  logout,
  waitFor,
  waitForTestId,
  logPass,
  logFail,
} = require('../helpers');

async function runAdminLoginTest() {
  console.log('\n🧪 TEST SUITE: Admin Login & Dashboard');
  console.log('─'.repeat(40));

  const driver = await buildDriver();
  let passed = 0;
  let failed = 0;

  try {
    // ── Test 3.1: Admin login and redirect ─────────────────────
    try {
      await loginAsAdmin(driver);
      const url = await driver.getCurrentUrl();
      if (!url.includes('/admin/dashboard')) {
        throw new Error(`Expected /admin/dashboard, got ${url}`);
      }
      logPass('Admin login redirects to /admin/dashboard');
      passed++;
    } catch (e) {
      logFail('Admin login redirects to /admin/dashboard', e);
      failed++;
    }

    // ── Test 3.2: Admin dashboard title ────────────────────────
    try {
      const title = await waitForTestId(driver, 'admin-dashboard-title');
      const text = await title.getText();
      if (!text.includes('Complaints')) {
        throw new Error(`Expected title containing "Complaints", got "${text}"`);
      }
      logPass('Admin dashboard title displays correctly');
      passed++;
    } catch (e) {
      logFail('Admin dashboard title displays correctly', e);
      failed++;
    }

    // ── Test 3.3: Stats section is visible ─────────────────────
    try {
      // Wait for the stats grid to render (look for stat cards)
      await driver.sleep(2000);
      const pageSource = await driver.getPageSource();
      const hasTotal    = pageSource.includes('Total');
      const hasPending  = pageSource.includes('Pending');
      const hasResolved = pageSource.includes('Resolved');

      if (!hasTotal || !hasPending || !hasResolved) {
        throw new Error('Stats section (Total/Pending/Resolved) not found');
      }
      logPass('Stats section (Total, Pending, Resolved) is visible');
      passed++;
    } catch (e) {
      logFail('Stats section visible', e);
      failed++;
    }

    // ── Test 3.4: Complaint cards are displayed ─────────────────
    try {
      const cards = await driver.findElements(By.css('[data-testid="complaint-card"]'));
      if (cards.length === 0) {
        throw new Error('No complaint cards found on admin dashboard');
      }
      logPass(`Admin can see complaint cards (${cards.length} found)`);
      passed++;
    } catch (e) {
      logFail('Complaint cards displayed on admin dashboard', e);
      failed++;
    }

    // ── Test 3.5: Category filter is present ────────────────────
    try {
      const filterSelect = await waitFor(driver, 'select');
      const isDisplayed = await filterSelect.isDisplayed();
      if (!isDisplayed) {
        throw new Error('Category filter select is not visible');
      }
      logPass('Category filter dropdown is available');
      passed++;
    } catch (e) {
      logFail('Category filter present', e);
      failed++;
    }

    // ── Test 3.6: Logout ────────────────────────────────────────
    try {
      await logout(driver);
      const url = await driver.getCurrentUrl();
      if (!url.includes('/auth')) {
        throw new Error(`Expected /auth after logout, got ${url}`);
      }
      logPass('Admin logout redirects to /auth');
      passed++;
    } catch (e) {
      logFail('Admin logout', e);
      failed++;
    }

  } finally {
    await driver.quit();
  }

  console.log(`\n  Results: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

if (require.main === module) {
  runAdminLoginTest().then(success => process.exit(success ? 0 : 1));
}

module.exports = { runAdminLoginTest };
