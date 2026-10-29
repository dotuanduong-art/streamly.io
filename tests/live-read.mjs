import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { build, preview } from 'vite';

const origin = process.env.LIVE_API_URL;
assert.ok(origin, 'Set LIVE_API_URL to the backend host to run this read-only test');
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE || 'C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs').href);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const genres = await (await fetch(`${origin}/api/genres`)).json();
const movies = await (await fetch(`${origin}/api/movies`)).json();
assert.ok(genres.length && movies.length);
try {
  for (const mode of ['B', 'C']) {
    process.env.VITE_API_URL = origin;
    process.env.VITE_USE_MOCK = 'false';
    process.env.VITE_USE_MOCK_AUTH = mode === 'B' ? 'true' : 'false';
    process.env.VITE_USE_MOCK_USER_DATA = 'true';
    const outDir = `tests/artifacts/live-${mode}`;
    await build({ logLevel: 'silent', build: { outDir, emptyOutDir: true } });
    const server = await preview({ logLevel: 'silent', build: { outDir }, preview: { host: 'localhost', port: 5183, strictPort: true } });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(15000);
    const errors = [];
    // Serve this test's frontend at the documented CORS origin without stopping
    // an existing dev server. Backend requests continue directly to the live host.
    await page.route('http://localhost:5173/**', async (route) => {
      const response = await route.fetch({ url: route.request().url().replace('http://localhost:5173', 'http://localhost:5183') });
      await route.fulfill({ response });
    });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await page.route('**/api/**', (route) => {
      assert.ok(['GET', 'OPTIONS'].includes(route.request().method()), 'Live backend test is read-only');
      return route.continue();
    });
    await page.route(/https:\/\/(image\.tmdb\.org|picsum\.photos|fonts\.googleapis\.com|fonts\.gstatic\.com)/, (route) => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750"><rect width="100%" height="100%" fill="#30323a"/></svg>' }));
    try {
      await page.goto(`http://localhost:5173/genre/${genres[0].id}`);
      await page.getByRole('heading', { level: 1 }).waitFor();
      assert.equal(await page.getByRole('heading', { name: 'Không thể tải thể loại', exact: true }).count(), 0);
      await page.reload();
      await page.getByRole('heading', { level: 1 }).waitFor();
      const movie = movies.find((item) => item.isVisible !== false);
      await page.goto(`http://localhost:5173/movie/${movie.id}`);
      await page.getByTestId('movie-title').waitFor();
      assert.equal(await page.getByTestId('movie-title').textContent(), movie.title);
      await page.getByTestId('search-toggle').click();
      await page.getByTestId('search-input').fill(movie.title.slice(0, 5));
      await page.getByTestId(`search-suggestion-${movie.id}`).waitFor();
      await page.getByTestId('search-button').click();
      await page.getByTestId(`movie-card-${movie.id}`).waitFor();
      await page.goto(`http://localhost:5173/movie/${movie.id}`);
      await page.getByTestId('detail-actions').getByTestId('my-list-button').click();
      await page.waitForURL('**/login');
      if (mode === 'B') {
        await page.getByTestId('login-email').fill('user@streamly.test');
        await page.getByTestId('login-password').fill('Streamly123!');
        await page.getByTestId('login-submit').click();
        await page.waitForURL(`**/movie/${movie.id}`);
        await page.getByTestId('detail-actions').getByTestId('my-list-button').click();
        await page.getByTestId('detail-actions').getByRole('button', { name: 'Xóa khỏi danh sách', exact: true }).waitFor();
        await page.goto('http://localhost:5173/my-list');
        await page.getByTestId(`movie-card-${movie.id}`).waitFor();
        await page.reload();
        await page.getByTestId(`movie-card-${movie.id}`).waitFor();
      }
      assert.deepEqual(errors, [], `Browser errors in live ${mode}`);
      console.log(`PASS live ${mode}: genres/detail/search/refresh/guest guard${mode === 'B' ? '/mock auth/My List' : ' (real login not attempted: no test credentials)'}`);
    } catch (error) {
      console.log('Live diagnostic:', await page.locator('main').innerText());
      console.log('Live browser errors:', errors);
      await page.screenshot({ path: 'tests/artifacts/live-diagnostic.png' });
      throw error;
    } finally { await page.close(); await new Promise((resolve) => server.httpServer.close(resolve)); }
  }
} finally { await browser.close(); }
