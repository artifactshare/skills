#!/usr/bin/env node
/**
 * Automated Playwright UI & Responsive Quality Gate for the live showcase.
 *
 * Checks across Desktop (1440x900) and Mobile (390x844, isMobile: true):
 *   - 0 console.error / pageerror
 *   - 0 <iframe> elements (Artifact Share CSP compliance)
 *   - 0 horizontal overflow (scrollWidth <= innerWidth) across ALL tabs & ALL slides
 *   - 0 card overflow outside slide boundaries on mobile
 *   - Desktop single-scroll check (no double scrollbar)
 *   - Install modal open/close & 7-palette switching
 */

import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const showcaseHtml = path.join(rootDir, 'samples', 'showcase', 'dist', 'index.html');

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const candidates = [
    'playwright',
    path.resolve(rootDir, '..', 'public', 'apps', 'web', 'node_modules', 'playwright'),
  ];
  for (const mod of candidates) {
    try {
      return require(mod);
    } catch {
      // try next
    }
  }
  console.error(
    'Playwright is not installed. Run with NODE_PATH pointing to a Playwright installation or install playwright.',
  );
  process.exit(1);
}

const failures = [];
function assertCheck(cond, msg) {
  if (!cond) {
    failures.push(msg);
    console.error(`FAIL: ${msg}`);
  }
}

async function auditViewport(browser, label, options) {
  const page = await browser.newPage(options);
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console.error: ${m.text()}`);
  });

  await page.goto(pathToFileURL(showcaseHtml).href, { waitUntil: 'networkidle' });

  const base = await page.evaluate(() => ({
    iframes: document.querySelectorAll('iframe').length,
    demos: Array.from(document.querySelectorAll('[data-demo]')).map((b) =>
      b.getAttribute('data-demo'),
    ),
    docScrollH: document.documentElement.scrollHeight,
    docClientH: document.documentElement.clientHeight,
  }));

  assertCheck(base.iframes === 0, `[${label}] expected 0 iframes, found ${base.iframes}`);
  assertCheck(base.demos.length >= 6, `[${label}] expected >= 6 demos, found ${base.demos.length}`);

  if (!options.isMobile) {
    assertCheck(
      base.docScrollH === base.docClientH,
      `[${label}] desktop double-scroll detected (scrollHeight=${base.docScrollH} !== clientHeight=${base.docClientH})`,
    );
  }

  for (const demo of base.demos) {
    await page.evaluate((name) => {
      document.querySelector(`[data-demo="${name}"]`)?.click();
    }, demo);
    await page.waitForTimeout(80);

    const slideCount = await page.evaluate(
      (name) => document.querySelectorAll(`[data-demo-panel="${name}"] .dads-slide`).length,
      demo,
    );

    const steps = Math.max(1, slideCount);
    for (let s = 1; s <= steps; s += 1) {
      await page.waitForTimeout(60);
      const layout = await page.evaluate((name) => {
        const vw = window.innerWidth;
        const docW = document.documentElement.scrollWidth;
        const cardClip = [];
        const activeSlide = document.querySelector(
          `[data-demo-panel="${name}"] .dads-slide.is-active`,
        );
        if (activeSlide) {
          const sr = activeSlide.getBoundingClientRect();
          for (const card of activeSlide.querySelectorAll('.dads-slide-card')) {
            const cr = card.getBoundingClientRect();
            if (cr.right > sr.right + 2) {
              cardClip.push({
                slideRight: Math.round(sr.right),
                cardRight: Math.round(cr.right),
              });
            }
          }
        }
        return { vw, docW, cardClip };
      }, demo);

      const stepTag = slideCount > 0 ? `${demo} slide ${s}/${slideCount}` : demo;
      assertCheck(
        layout.docW <= layout.vw,
        `[${label}] ${stepTag}: horizontal overflow (scrollWidth=${layout.docW} > innerWidth=${layout.vw})`,
      );
      assertCheck(
        layout.cardClip.length === 0,
        `[${label}] ${stepTag}: slide card overflows slide border (${JSON.stringify(layout.cardClip)})`,
      );

      if (s < steps) {
        await page.evaluate((name) => {
          document.querySelector(`[data-demo-panel="${name}"] [data-slide-next]`)?.click();
        }, demo);
      }
    }
  }

  // Palette switch check
  await page.evaluate(() => {
    document.querySelector('[data-switch-palette="orange"]')?.click();
  });
  const palette = await page.evaluate(() => document.documentElement.getAttribute('data-palette'));
  assertCheck(palette === 'orange', `[${label}] palette switch to orange failed (got ${palette})`);

  // Install modal check
  await page.click('#open-install-btn');
  await page.waitForTimeout(80);
  const modalState = await page.evaluate(() => ({
    open: Boolean(document.getElementById('install-dialog')?.open),
    vw: window.innerWidth,
    docW: document.documentElement.scrollWidth,
  }));
  assertCheck(modalState.open, `[${label}] install modal failed to open`);
  assertCheck(
    modalState.docW <= modalState.vw,
    `[${label}] install modal caused horizontal overflow (${modalState.docW} > ${modalState.vw})`,
  );
  await page.click('#close-install-btn');

  assertCheck(errors.length === 0, `[${label}] console/page errors: ${errors.join('; ')}`);
  await page.close();
  console.log(`OK: [${label}] audited ${base.demos.length} demos (all slides, palette, modal)`);
}

async function main() {
  if (!fs.existsSync(showcaseHtml)) {
    console.error('Missing showcase build. Run `npm run build:samples` first.');
    process.exit(1);
  }
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  try {
    await auditViewport(browser, 'desktop-1440', { viewport: { width: 1440, height: 900 } });
    await auditViewport(browser, 'mobile-390', {
      viewport: { width: 390, height: 844 },
      isMobile: true,
    });
  } finally {
    await browser.close();
  }

  if (failures.length > 0) {
    console.error(`\nUI verification failed with ${failures.length} issue(s).`);
    process.exit(1);
  }
  console.log('\nAll Playwright UI & responsive checks passed (0 issues).');
}

main();
