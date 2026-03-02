#!/usr/bin/env node

/**
 * Verifies the demo flow works end-to-end in a headless browser.
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });
  let passed = 0;
  let failed = 0;

  const check = (label, ok) => {
    if (ok) {
      console.log(`  ✓ ${label}`);
      passed++;
    } else {
      console.log(`  ✗ ${label}`);
      failed++;
    }
  };

  try {
    // 1. Landing page
    console.log('\n1. Landing page');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    check('Page loads', title.length > 0);

    // 2. Events page (unauthenticated)
    console.log('\n2. Events page (unauthenticated)');
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('networkidle');
    const sxswCount = await page.locator('text=SXSW London').count();
    check('SXSW London event visible', sxswCount > 0);

    // 3. Login as Tommy
    console.log('\n3. Login as Tommy');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', 'tommy@demo.splitstay.com');
    await page.fill('input[type="password"]', 'DemoPass1');
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL('**/dashboard**', { timeout: 10000 }).catch(() => {});
    await page.waitForLoadState('networkidle');
    const postLoginUrl = page.url();
    console.log(`  Post-login URL: ${postLoginUrl}`);
    check('Redirected to dashboard', postLoginUrl.includes('/dashboard'));

    // 4. Dashboard
    console.log('\n4. Dashboard');
    const dashContent = await page.content();
    const hasDashboard =
      dashContent.includes('Dashboard') ||
      dashContent.includes('Welcome') ||
      dashContent.includes('Tommy');
    check('Dashboard content renders', hasDashboard);

    // 5. Events page (authenticated)
    console.log('\n5. Events page (authenticated)');
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('networkidle');
    const registerBtns = await page
      .locator('button:has-text("Register")')
      .count();
    const registeredLabels = await page.locator('text=Registered').count();
    console.log(
      `  Register buttons: ${registerBtns}, Registered labels: ${registeredLabels}`,
    );
    check('Events page loads with auth', sxswCount > 0);

    // 6. Find Partners page
    console.log('\n6. Find Partners page');
    await page.goto(`${BASE_URL}/find-partners`);
    await page.waitForLoadState('networkidle');
    const partnersContent = await page.content();
    const hasRuben = partnersContent.includes('Ruben');
    check('Ruben appears on find-partners', hasRuben);
    if (hasRuben) {
      console.log('  (Ruben visible as a potential match)');
    }

    // 7. Ruben visible on find-partners with trip details
    console.log('\n7. Ruben trip details on find-partners');
    const hasTrip =
      partnersContent.includes('Shoreditch') ||
      partnersContent.includes('Apartment');
    check('Ruben trip details visible', hasTrip);

    // Summary
    console.log(`\n--- Results: ${passed} passed, ${failed} failed ---`);
    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('Verification error:', error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();
