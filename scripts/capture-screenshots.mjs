/**
 * Captures submission screenshots from a running dev server.
 *
 *   npm run dev            # in another terminal
 *   node scripts/capture-screenshots.mjs [outDir]
 *
 * Pages are client-rendered behind a loading state, so each shot waits for the
 * splash to clear rather than firing on `load` — a naive screenshot catches
 * "Initializing secure environment..." every time.
 */

import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const OUT = process.argv[2] || join(process.env.HOME, 'poh-submission');

/**
 * `zoom` scales the page down so one frame holds more of a section — 0.6 fits
 * roughly 65% more in each direction. `height` lengthens the viewport for
 * pages whose interesting content is stacked vertically. Both are applied as
 * CSS pixels; `deviceScaleFactor` keeps the output crisp regardless.
 */
const PAGES = [
  { name: '01-landing-hero', path: '/', zoom: 0.85 },
  { name: '02-landing-full', path: '/', full: true, zoom: 0.8 },
  { name: '03-onboarding', path: '/onboarding', zoom: 0.85 },
  // Discover has the most to show: the screening panel *and* the match grid.
  // Height stops just after the first row — profiles 4-6 are seeded with
  // `/placeholder.svg`, so a taller frame only adds empty cards.
  { name: '04-explore', path: '/explore', zoom: 0.58, height: 840 },
  { name: '05-create-twin', path: '/create-twin', zoom: 0.65, height: 1100 },
  { name: '06-ai-twin', path: '/ai-twin', zoom: 0.68, height: 880 },
  { name: '07-chats', path: '/chats', zoom: 0.7, height: 1050 },
  { name: '08-chat-with-twin', path: '/chat-with-twin', zoom: 0.7, height: 1050 },
  { name: '09-profile', path: '/profile', zoom: 0.7, height: 1050 },
  { name: '10-user', path: '/user', zoom: 0.68, height: 1100 },
];

const BASE_VIEWPORT = { width: 1600, height: 1000 };

/** Waits for the splash to clear and animations to settle. */
async function settle(page) {
  await page
    .waitForFunction(() => !document.body.innerText.includes('Initializing secure environment'), {
      timeout: 15000,
    })
    .catch(() => {});

  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1200);
}

/**
 * Scrolls the whole page and returns to the top.
 *
 * Sections animate in on `whileInView`, so a full-page screenshot taken
 * without this is mostly blank space where the below-the-fold content should
 * be — the elements exist but are still at opacity 0.
 */
async function triggerScrollAnimations(page) {
  await page.evaluate(async () => {
    // `scroll-behavior: smooth` turns the return-to-top into an animation that
    // is still running when the screenshot fires, so shots come out scrolled
    // halfway down the hero. Force instant scrolling for the duration.
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';

    const step = window.innerHeight * 0.75;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 220));
    }

    window.scrollTo(0, 0);
    root.scrollTop = 0;
    document.body.scrollTop = 0;
    await new Promise((resolve) => setTimeout(resolve, 300));
    root.style.scrollBehavior = previous;
  });

  await page.waitForFunction(() => window.scrollY < 5, { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(900);
}

/**
 * Removes the Next.js dev overlay.
 *
 * Its "1 error" badge sits in the corner of every dev-server screenshot and
 * reads as a broken app in a submission gallery. The error itself is the
 * pre-existing NFT-service one, which only fires without a wallet.
 */
async function hideDevOverlay(page) {
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {});
  await page.evaluate(() => {
    for (const portal of document.querySelectorAll('nextjs-portal')) portal.remove();
  });
}

/**
 * Forces lazy images to decode.
 *
 * Cards below the fold ship `loading="lazy"`, so at a zoomed-out scale the
 * extra rows that come into frame render as empty placeholders — worse than
 * not showing them at all.
 */
async function loadImages(page) {
  await page.evaluate(() => {
    for (const img of document.querySelectorAll('img')) {
      img.loading = 'eager';
      if (img.dataset.src && !img.src) img.src = img.dataset.src;
    }
  });

  await page
    .waitForFunction(
      () => [...document.querySelectorAll('img')].every((img) => img.complete),
      { timeout: 12000 },
    )
    .catch(() => {});

  await page.waitForTimeout(600);
}

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: BASE_VIEWPORT,
  deviceScaleFactor: 2, // retina — submission galleries upscale badly otherwise
});

// Explore, chats and the twin screens redirect to onboarding without this
// flag, so every shot of them would otherwise be the same welcome card.
await context.addInitScript(() => {
  try {
    localStorage.setItem('onboardingCompleted', 'true');
  } catch {
    /* storage unavailable; the page will redirect and the shot is skipped */
  }
});

const page = await context.newPage();
page.on('pageerror', () => {});

await mkdir(OUT, { recursive: true });

for (const target of PAGES) {
  try {
    // Sized before navigation so the app's own breakpoint logic sees the
    // final dimensions rather than reflowing mid-capture.
    await page.setViewportSize({
      width: BASE_VIEWPORT.width,
      height: target.height || BASE_VIEWPORT.height,
    });

    await page.goto(BASE + target.path, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await settle(page);

    if (target.zoom && target.zoom !== 1) {
      await page.evaluate((zoom) => {
        document.documentElement.style.zoom = String(zoom);
      }, target.zoom);
      // Let the reflow finish and any in-view animations re-evaluate.
      await page.waitForTimeout(700);
    }

    await triggerScrollAnimations(page);
    await loadImages(page);
    await hideDevOverlay(page);
    await page.screenshot({
      path: join(OUT, `${target.name}.png`),
      fullPage: Boolean(target.full),
    });
    console.log(`captured ${target.name} <- ${target.path}`);
  } catch (error) {
    console.warn(`skipped ${target.path}: ${error.message.split('\n')[0]}`);
  }
}

await browser.close();
console.log(`\nwrote to ${OUT}`);
