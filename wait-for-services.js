/**
 * wait-for-services.js
 *
 * Simple script that polls the frontend and API gateway until they respond.
 * Used by Jenkins to wait for Docker Compose services to be ready
 * before running Selenium tests.
 *
 * Usage:  node wait-for-services.js
 * Exit 0 = all services ready, Exit 1 = timed out
 */

const http = require('http');

const SERVICES = [
  { name: 'Frontend',    url: 'http://localhost:5173' },
  { name: 'API Gateway', url: 'http://localhost:5005/api/complaints' },
];

const MAX_RETRIES = 30;   // 30 attempts
const INTERVAL_MS = 3000; // 3 seconds between attempts
// Total max wait: 30 × 3s = 90 seconds

function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    }).on('error', () => resolve(false));
  });
}

async function waitForAll() {
  console.log('⏳ Waiting for services to become ready...\n');

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const results = await Promise.all(
      SERVICES.map(async (svc) => {
        const ok = await checkUrl(svc.url);
        return { ...svc, ok };
      })
    );

    const allReady = results.every((r) => r.ok);

    results.forEach((r) => {
      console.log(`  [Attempt ${attempt}/${MAX_RETRIES}] ${r.name}: ${r.ok ? '✅ Ready' : '⏳ Not ready'}`);
    });

    if (allReady) {
      console.log('\n✅ All services are ready!\n');
      process.exit(0);
    }

    console.log('');
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }

  console.error('\n❌ Timed out waiting for services after 90 seconds.');
  process.exit(1);
}

waitForAll();
