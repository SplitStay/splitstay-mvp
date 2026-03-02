import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
// Use Playwright from a sibling project that has it installed
const { chromium } = require('/home/tommy/src/hpb/node_modules/playwright');

const DEMO_URL = 'http://localhost:5174/whatsapp';
const OUTPUT_DIR = './demo-recordings';

// Multi-turn conversation showcasing the matching flow
const messages = [
  { text: 'Hi! Looking for accommodation at SXSW London', readTime: 5000 },
  { text: "Tell me more about Ruben's place", readTime: 5000 },
  { text: 'What about the price and dates?', readTime: 5000 },
  { text: "Yes I'm interested!", readTime: 4000 },
  { text: 'Are there any other matches?', readTime: 5000 },
];

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function typeSlowly(page, selector, text) {
  await page.click(selector);
  for (const char of text) {
    await page.keyboard.type(char, { delay: 35 + Math.random() * 25 });
  }
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: OUTPUT_DIR, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();

  await page.goto(DEMO_URL, { waitUntil: 'networkidle' });
  // Brief pause on the empty chat screen
  await sleep(1500);

  for (const msg of messages) {
    // Type the message character by character
    await typeSlowly(page, 'input[placeholder="Type a message"]', msg.text);
    await sleep(600);

    // Click send
    await page.click('button[aria-label="Send message"]');

    // Wait for bot response (loading dots appear then disappear)
    await page
      .waitForSelector('.animate-bounce', { timeout: 5000 })
      .catch(() => {});
    await page.waitForFunction(
      () => !document.querySelector('.animate-bounce'),
      { timeout: 30000 },
    );

    // Pause to let the viewer read the response
    await sleep(msg.readTime);
  }

  // Final pause on the completed conversation
  await sleep(2000);

  await context.close();
  await browser.close();

  console.log(`Demo recorded to ${OUTPUT_DIR}/`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
