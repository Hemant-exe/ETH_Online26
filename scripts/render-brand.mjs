/**
 * Renders the brand assets for the ETHOnline submission.
 *
 *   node scripts/render-brand.mjs [outDir]
 *
 * Everything is drawn as HTML/SVG and rasterised through Playwright's
 * Chromium at 2x, so the marks stay crisp and can be regenerated after a
 * palette change rather than being re-cut by hand.
 */

import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import { chromium } from 'playwright';

const OUT = process.argv[2] || join(process.env.HOME, 'poh-submission');

const PINK = '#EC4899';
const MAGENTA = '#DB2777';
const PURPLE = '#8B5CF6';
const VIOLET = '#6D28D9';
const PLUM = '#2E0B45';

/** The mark: a heart whose interior is a proof check. */
function heartMark({ id, size, glow = false }) {
  return `
<svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g-${id}" x1="8" y1="4" x2="92" y2="92" gradientUnits="userSpaceOnUse">
      <stop stop-color="${PURPLE}"/>
      <stop offset="0.55" stop-color="${PINK}"/>
      <stop offset="1" stop-color="${MAGENTA}"/>
    </linearGradient>
    ${
      glow
        ? `<filter id="f-${id}" x="-40%" y="-40%" width="180%" height="180%">
             <feGaussianBlur stdDeviation="5" result="b"/>
             <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
           </filter>`
        : ''
    }
  </defs>
  <g ${glow ? `filter="url(#f-${id})"` : ''}>
    <path d="M50 89C19.5 66.5 4 48.8 4 30.5 4 16.4 15.2 5.5 28.8 5.5 38.4 5.5 46.2 11.4 50 19.4c3.8-8 11.6-13.9 21.2-13.9C84.8 5.5 96 16.4 96 30.5 96 48.8 80.5 66.5 50 89Z"
          fill="url(#g-${id})"/>
    <path d="M31 45.5 44.5 59 71 32"
          stroke="#FFFFFF" stroke-width="9.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
}

const FONT = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800;900&display=swap" rel="stylesheet">`;

/** A faint heart lattice, so the cover is not a flat gradient. */
const LATTICE = `<svg width="100%" height="100%" style="position:absolute;inset:0;opacity:.07">
  <defs><pattern id="h" width="70" height="70" patternUnits="userSpaceOnUse">
    <path d="M35 46C24 38 18 32 18 25.5 18 20.5 22 17 26.8 17 29.9 17 33.4 18.9 35 22c1.6-3.1 5.1-5 8.2-5C48 17 52 20.5 52 25.5 52 32 46 38 35 46Z" fill="#fff"/>
  </pattern></defs>
  <rect width="100%" height="100%" fill="url(#h)"/>
</svg>`;

/** One sponsor chip. */
function chip(px) {
  return (label) => `
  <div style="padding:${px(11)} ${px(20)};border-radius:${px(12)};
              border:1px solid #ffffff2e;background:#ffffff12;
              font:600 ${px(20)}/1 Inter,system-ui,sans-serif;color:#EADCFB">${label}</div>`;
}

const ASSETS = [
  {
    name: 'logo-1024',
    width: 1024,
    height: 1024,
    html: `<div style="width:1024px;height:1024px;display:grid;place-items:center">
             ${heartMark({ id: 'l', size: 840 })}
           </div>`,
    transparent: true,
  },
  {
    name: 'logo-512',
    width: 512,
    height: 512,
    html: `<div style="width:512px;height:512px;display:grid;place-items:center">
             ${heartMark({ id: 's', size: 420 })}
           </div>`,
    transparent: true,
  },
  {
    name: 'logo-wordmark',
    width: 1200,
    height: 320,
    html: `<div style="width:1200px;height:320px;display:flex;align-items:center;justify-content:center;gap:38px">
             ${heartMark({ id: 'w', size: 176 })}
             <div style="font:900 104px/1 Inter,system-ui,sans-serif;letter-spacing:-.035em;color:${PLUM}">
               Proof of Heart
             </div>
           </div>`,
    transparent: true,
  },
  {
    name: 'cover-1200x630',
    width: 1200,
    height: 630,
    html: cover(1),
  },
  {
    name: 'cover-1920x1080',
    width: 1920,
    height: 1080,
    html: cover(1920 / 1200),
  },
];

/** The gallery cover. `k` scales every dimension off the 1200x630 design. */
function cover(k) {
  const px = (n) => `${Math.round(n * k)}px`;

  return `
<div style="position:relative;width:${px(1200)};height:${px(630)};overflow:hidden;
            background:radial-gradient(120% 140% at 12% 8%, ${VIOLET} 0%, ${PLUM} 55%, #1B0630 100%);
            display:flex;align-items:center">
  ${LATTICE}
  <div style="position:absolute;right:${px(-140)};top:${px(-120)};width:${px(620)};height:${px(620)};
              border-radius:50%;background:radial-gradient(circle, ${MAGENTA}66 0%, transparent 68%)"></div>
  <div style="position:absolute;left:${px(-180)};bottom:${px(-220)};width:${px(560)};height:${px(560)};
              border-radius:50%;background:radial-gradient(circle, ${PURPLE}55 0%, transparent 70%)"></div>

  <div style="position:relative;display:flex;align-items:center;gap:${px(64)};padding:0 ${px(78)};width:100%">
    <div style="flex:1;min-width:0">
      <div style="display:inline-flex;align-items:center;gap:${px(10)};
                  padding:${px(9)} ${px(20)};border-radius:${px(999)};
                  border:1px solid #ffffff33;background:#ffffff14;
                  font:600 ${px(19)}/1 Inter,system-ui,sans-serif;color:#F9D7EA;
                  letter-spacing:.02em;margin-bottom:${px(30)}">
        ETHOnline 2026 · Continuity Track
      </div>

      <div style="font:900 ${px(82)}/0.98 Inter,system-ui,sans-serif;letter-spacing:-.04em;color:#fff">
        Proof of Heart
      </div>

      <div style="font:600 ${px(33)}/1.28 Inter,system-ui,sans-serif;letter-spacing:-.015em;
                  color:#F5C9E4;margin-top:${px(22)}">
        One verified human,<br>one dating profile.
      </div>

      <div style="font:400 ${px(23)}/1.5 Inter,system-ui,sans-serif;color:#CBB6E8;margin-top:${px(20)}">
        Your AI twin screens the date first — and pays per turn.
      </div>

      <div style="display:flex;gap:${px(12)};margin-top:${px(40)}">
        ${['World ID', 'AgentBook', 'Hedera x402', 'HCS'].map(chip(px)).join('')}
      </div>
    </div>

    <div style="flex:0 0 auto;display:grid;place-items:center;padding-right:${px(14)}">
      ${heartMark({ id: 'c', size: Math.round(330 * k), glow: true })}
    </div>
  </div>
</div>`;
}

const browser = await chromium.launch();
await mkdir(OUT, { recursive: true });

for (const asset of ASSETS) {
  const context = await browser.newContext({
    viewport: { width: asset.width, height: asset.height },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.setContent(
    `<!doctype html><html><head><meta charset="utf-8">${FONT}
     <style>*{margin:0;padding:0;box-sizing:border-box}
     body{width:${asset.width}px;height:${asset.height}px;overflow:hidden;
          background:${asset.transparent ? 'transparent' : '#1B0630'}}</style></head>
     <body>${asset.html}</body></html>`,
    { waitUntil: 'networkidle' },
  );

  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  await page.screenshot({
    path: join(OUT, `${asset.name}.png`),
    omitBackground: Boolean(asset.transparent),
  });

  console.log(`rendered ${asset.name}  ${asset.width}x${asset.height} @2x`);
  await context.close();
}

await browser.close();
console.log(`\nwrote to ${OUT}`);
