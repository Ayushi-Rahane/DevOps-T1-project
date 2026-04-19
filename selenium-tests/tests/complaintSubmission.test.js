/**
 * Test 2: Complaint Submission Flow
 *
 * Steps:
 *  1. Login as student (alice@campus.com)
 *  2. Navigate to Raise Complaint page
 *  3. Fill in subject, description, select category
 *  4. Submit the form
 *  5. Verify redirect to My Complaints
 *  6. Verify the new complaint appears in the list
 *  7. Logout
 */

const { By, until } = require('selenium-webdriver');
const {
  buildDriver,
  loginAsStudent,
  logout,
  waitFor,
  waitForTestId,
  clearAndType,
  logPass,
  logFail,
} = require('../helpers');

async function runComplaintSubmissionTest() {
  console.log('\n🧪 TEST SUITE: Complaint Submission Flow');
  console.log('─'.repeat(40));

  const driver = await buildDriver();
  let passed = 0;
  let failed = 0;

  // Unique subject so we can identify it later
  const testSubject = `Selenium Test Complaint ${Date.now()}`;

  try {
    // ── Step 1: Login ──────────────────────────────────────────
    await loginAsStudent(driver);

    // ── Test 2.1: Navigate to Raise Complaint page ─────────────
    try {
      const raiseBtn = await waitForTestId(driver, 'nav-raise-complaint');
      await raiseBtn.click();
      await waitForTestId(driver, 'raise-complaint-title');
      logPass('Navigated to Raise Complaint page');
      passed++;
    } catch (e) {
      logFail('Navigate to Raise Complaint page', e);
      failed++;
    }

    // ── Test 2.2: Fill in complaint form ───────────────────────
    try {
      const subjectInput = await waitFor(driver, 'input[name="subject"]');
      await clearAndType(driver, subjectInput, testSubject);

      const descInput = await waitFor(driver, 'textarea[name="description"]');
      await clearAndType(driver, descInput, 'This is an automated test complaint created by Selenium.');

      const categorySelect = await waitFor(driver, 'select[name="category"]');
      await categorySelect.sendKeys('Infrastructure');

      logPass('Complaint form filled in');
      passed++;
    } catch (e) {
      logFail('Fill in complaint form', e);
      failed++;
    }

    // ── Test 2.3: Submit the complaint ─────────────────────────
    try {
      // Handle the alert that appears on success
      const submitBtn = await waitFor(driver, 'button[type="submit"]');
      await submitBtn.click();

      // Wait for the browser alert "Complaint submitted successfully!"
      await driver.wait(until.alertIsPresent(), 10000);
      const alert = await driver.switchTo().alert();
      const alertText = await alert.getText();
      await alert.accept();

      if (!alertText.includes('successfully')) {
        throw new Error(`Expected success alert, got: "${alertText}"`);
      }

      logPass('Complaint submitted successfully (alert confirmed)');
      passed++;
    } catch (e) {
      logFail('Submit complaint', e);
      failed++;
    }

    // ── Test 2.4: Verify redirect to My Complaints ─────────────
    try {
      await waitForTestId(driver, 'my-complaints-title');
      const url = await driver.getCurrentUrl();
      if (!url.includes('/my-complaints')) {
        throw new Error(`Expected /my-complaints, got ${url}`);
      }
      logPass('Redirected to My Complaints page');
      passed++;
    } catch (e) {
      logFail('Redirect to My Complaints', e);
      failed++;
    }

    // ── Test 2.5: New complaint appears in the list ─────────────
    try {
      await driver.sleep(2000); // Wait for API to return fresh data
      const pageSource = await driver.getPageSource();
      if (!pageSource.includes(testSubject)) {
        throw new Error('Submitted complaint not found on My Complaints page');
      }
      logPass('New complaint visible on My Complaints page');
      passed++;
    } catch (e) {
      logFail('New complaint visible', e);
      failed++;
    }

    // ── Cleanup: logout ────────────────────────────────────────
    await logout(driver);

  } finally {
    await driver.quit();
  }

  console.log(`\n  Results: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

if (require.main === module) {
  runComplaintSubmissionTest().then(success => process.exit(success ? 0 : 1));
}

module.exports = { runComplaintSubmissionTest };
