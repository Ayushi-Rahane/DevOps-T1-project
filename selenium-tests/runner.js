/**
 * runner.js — Runs all Selenium E2E tests sequentially
 *
 * Usage:
 *   cd selenium-tests && npm test
 *   — or from project root —
 *   npm run test:selenium
 */

const { runStudentLoginTest }        = require('./tests/studentLogin.test');
const { runComplaintSubmissionTest }  = require('./tests/complaintSubmission.test');
const { runAdminLoginTest }           = require('./tests/adminLogin.test');

async function runAll() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   IssueSphere — Selenium E2E Test Suite  ║');
  console.log('╚══════════════════════════════════════════╝');

  const results = [];

  results.push({ name: 'Student Login',          ok: await runStudentLoginTest() });
  results.push({ name: 'Complaint Submission',    ok: await runComplaintSubmissionTest() });
  results.push({ name: 'Admin Login & Dashboard', ok: await runAdminLoginTest() });

  // ── Summary ────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(44));
  console.log('  FINAL SUMMARY');
  console.log('═'.repeat(44));
  results.forEach(r => {
    console.log(`  ${r.ok ? '✅' : '❌'} ${r.name}`);
  });

  const allPassed = results.every(r => r.ok);
  console.log(`\n  Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}\n`);

  process.exit(allPassed ? 0 : 1);
}

runAll();
