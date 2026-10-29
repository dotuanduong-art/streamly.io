import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { createServer } from 'vite';

const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE || 'C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs').href);
process.env.VITE_USE_MOCK = 'true';
process.env.VITE_USE_MOCK_AUTH = 'true';
process.env.VITE_USE_MOCK_USER_DATA = 'true';
const server = await createServer({ server: { host: 'localhost', port: 5184, strictPort: true } });
await server.listen();
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
try {
  for (const touch of [false, true]) {
    const context = await browser.newContext({ viewport: { width: touch ? 375 : 1280, height: 800 }, hasTouch: touch, isMobile: touch, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.setDefaultNavigationTimeout(12000);
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await context.route(/https:\/\/(picsum\.photos|fonts\.googleapis\.com|fonts\.gstatic\.com)/, (route) => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750"><rect width="100%" height="100%" fill="#30323a"/></svg>' }));
    await page.addInitScript(() => {
      window.qaCLS = 0;
      new PerformanceObserver((entries) => {
        for (const entry of entries.getEntries()) if (!entry.hadRecentInput) window.qaCLS += entry.value;
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('http://localhost:5184/movie/2');
    await page.getByRole('status', { name: 'Đang tải thông tin phim', exact: true }).waitFor();
    await page.getByTestId('movie-title').waitFor();
    await page.waitForFunction(() => [...document.querySelectorAll('.detail-grid > div')].every((node) => getComputedStyle(node).transform === 'none' && getComputedStyle(node).opacity === '1'));
    const cls = await page.evaluate(() => window.qaCLS);
    assert.ok(cls < 0.05, `detail CLS ${cls}`);
    await page.goto('http://localhost:5184/');
    await page.getByTestId('hero-more-info-button').waitFor();
    await page.evaluate(() => window.scrollTo(0, 160));
    await page.waitForFunction(() => getComputedStyle(document.querySelector('header > [aria-hidden=true]')).opacity === '1');
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.hero-frame > div')).transform !== 'none');
    const row = page.getByTestId('movie-row-newly-added');
    await row.scrollIntoViewIfNeeded();
    const cards = row.locator('.movie-card');
    await page.waitForFunction(() => [...document.querySelectorAll('[data-testid=movie-row-newly-added] .movie-card')].slice(0, 2).every((node) => getComputedStyle(node.parentElement).opacity === '1'));
    const neighborBefore = await cards.nth(1).boundingBox();
    await cards.first().hover();
    if (touch) {
      assert.equal(await cards.first().evaluate((node) => getComputedStyle(node).transform), 'none');
      assert.equal(await cards.first().locator('.movie-card-touch-action').isVisible(), true);
    } else {
      await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-testid=movie-row-newly-added] .movie-card')).transform.startsWith('matrix(1.05,'));
      assert.deepEqual(await cards.nth(1).boundingBox(), neighborBefore, 'hover moves neighboring card');
      await page.screenshot({ path: 'tests/artifacts/hover-desktop.png' });
    }
    const viewport = row.locator('.carousel-viewport');
    const track = viewport.locator(':scope > div');
    const before = await track.evaluate((node) => getComputedStyle(node).transform);
    const box = await viewport.boundingBox();
    await page.mouse.move(box.x + box.width * 0.8, box.y + 60);
    await page.mouse.down();
    await page.mouse.move(box.x + 30, box.y + 60, { steps: 15 });
    await page.mouse.up();
    await page.waitForFunction(({ element, before }) => getComputedStyle(element).transform !== before, { element: await track.elementHandle(), before });
    console.log(`PASS normal motion, ${touch ? 'touch controls' : 'hover + stable neighbors'}, parallax, nav blur, Embla drag; detail CLS=${cls}`);
    await context.close();
  }
  assert.deepEqual(errors, []);
} finally { await browser.close(); await server.close(); }
