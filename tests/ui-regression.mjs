import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { createServer } from 'vite';

const playwrightPath = process.env.PLAYWRIGHT_MODULE || 'C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const { chromium } = await import(pathToFileURL(playwrightPath).href);
process.env.VITE_USE_MOCK = 'true';
process.env.VITE_USE_MOCK_AUTH = 'true';
process.env.VITE_USE_MOCK_USER_DATA = 'true';
const server = await createServer({ server: { host: 'localhost', port: 5180, strictPort: true } });
await server.listen();
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const output = 'tests/artifacts';
await mkdir(output, { recursive: true });
const baseline = process.argv.includes('--baseline');
const results = [];
try {
  for (const width of [1440, 1280, 768, 375]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    // Local browser fixtures, isolated from the application's shipped catalog.
    await page.addInitScript(() => {
      localStorage.setItem('streamly_mock_movies_overrides', JSON.stringify({
        2: { overview: 'Một chuyến đi.', updatedAt: '2026-10-29T00:00:00Z' },
        3: { overview: 'Một câu chuyện dài về những chuyến phiêu lưu và tình bạn. '.repeat(100), updatedAt: '2026-10-29T00:00:00Z' },
        4: { title: 'Một tựa phim rất dài kể về những chuyến phiêu lưu xuyên qua các thiên hà xa xôi '.repeat(5), updatedAt: '2026-10-29T00:00:00Z' },
        5: { overview: null, posterUrl: null, backdropUrl: null, genres: [], voteAverage: null, updatedAt: '2026-10-29T00:00:00Z' },
      }));
    });
    await page.route(/https:\/\/(picsum\.photos|fonts\.googleapis\.com|fonts\.gstatic\.com)/, (route) => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750"><rect width="100%" height="100%" fill="#30323a"/></svg>' }));
    const positions = [];
    for (const id of [2, 3, 4, 5, 11]) {
      await page.goto(`http://localhost:5180/movie/${id}`, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('movie-title').waitFor();
      await page.getByTestId('movie-row-more-movies').locator('[data-testid^="movie-card-"]').first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      const title = await page.getByTestId('movie-title').boundingBox();
      const actions = await page.getByTestId('watch-button').boundingBox();
      const poster = baseline ? await page.locator('article > header img[alt^="Áp phích"], article > header [role="img"]').first().boundingBox() : await page.getByTestId('detail-poster').boundingBox();
      const recommendations = await page.getByTestId('movie-row-more-movies').boundingBox();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      positions.push({ id, titleY: title.y, actionsY: actions.y, posterY: poster?.y, recommendationsY: recommendations?.y, overflow });
      if (id === 3 || id === 5) await page.screenshot({ path: `${output}/${baseline ? 'before' : 'after'}-${width}-${id}.png`, fullPage: true });
    }
    results.push({ width, positions });
    await page.close();
    if (!baseline) {
      for (const field of ['titleY', 'actionsY', 'posterY', 'recommendationsY']) {
        const values = positions.map((item) => item[field]);
        assert.ok(Math.max(...values) - Math.min(...values) <= 1, `${width}: unstable ${field}: ${values}`);
      }
      assert.ok(positions.every((item) => !item.overflow), `${width}: horizontal overflow`);
    }
  }
  console.log(JSON.stringify(results, null, 2));
  await writeFile(`${output}/${baseline ? 'before' : 'after'}-layout.json`, JSON.stringify(results, null, 2));
  if (baseline) {
    const values = results[0].positions.map((item) => item.actionsY);
    assert.ok(Math.max(...values) - Math.min(...values) <= 1, `REPRODUCED: action position moves by ${Math.round(Math.max(...values) - Math.min(...values))}px`);
  }
} finally {
  await browser.close();
  await server.close();
}
