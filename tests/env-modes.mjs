import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { build, preview } from 'vite';

const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE || 'C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs').href);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const genres = [{ id: 1, name: 'Action' }, { id: 2, name: 'Science Fiction' }, { id: 3, name: 'Drama' }];
const movies = Array.from({ length: 27 }, (_, i) => ({ id: i + 1, tmdbId: 1000 + i, title: `Transport Movie ${i + 1}`, overview: i === 0 ? null : 'Nội dung thử nghiệm API.', isVisible: true, isFeatured: i === 0, genres: [genres[0]], createdAt: '2026-10-29T00:00:00Z', updatedAt: '2026-10-29T00:00:00Z' }));
const user = { id: 50, email: 'qa@streamly.test', displayName: 'QA User', role: 'User', createdAt: '2026-10-29T00:00:00Z' };

try {
  for (const mode of ['A', 'B', 'C']) {
    process.env.VITE_API_URL = 'https://streamly-qa.invalid';
    process.env.VITE_USE_MOCK = mode === 'A' ? 'true' : 'false';
    process.env.VITE_USE_MOCK_AUTH = mode === 'C' ? 'false' : 'true';
    process.env.VITE_USE_MOCK_USER_DATA = 'true';
    const outDir = `tests/artifacts/build-${mode}`;
    await build({ logLevel: 'silent', build: { outDir, emptyOutDir: true } });
    const server = await preview({ logLevel: 'silent', build: { outDir }, preview: { host: 'localhost', port: 5182, strictPort: true } });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.setDefaultNavigationTimeout(12000);
    const calls = [];
    const errors = [];
    let errorGenres = false;
    let errorMovies = false;
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error' && !((errorGenres || errorMovies) && message.text().includes('503'))) errors.push(message.text());
    });
    await context.route(/https:\/\/(picsum\.photos|fonts\.googleapis\.com|fonts\.gstatic\.com)/, (route) => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750"><rect width="100%" height="100%" fill="#30323a"/></svg>' }));
    await context.route('https://streamly-qa.invalid/api/**', async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      calls.push(`${req.method()} ${url.pathname}`);
      let data;
      if (url.pathname === '/api/genres') data = errorGenres ? { message: 'Lỗi thể loại thử nghiệm' } : genres;
      else if (url.pathname === '/api/genres/1/movies') data = errorMovies ? { title: 'Dịch vụ tạm dừng', detail: 'Không thể tải phim thử nghiệm.' } : movies;
      else if (/\/api\/genres\/\d+\/movies/.test(url.pathname)) data = [];
      else if (url.pathname === '/api/movies/search') data = movies.filter((movie) => movie.title.includes(url.searchParams.get('q'))).slice(0, Number(url.searchParams.get('limit') || 50));
      else if (url.pathname === '/api/movies') data = movies;
      else if (/\/api\/movies\/\d+$/.test(url.pathname)) data = movies.find((movie) => movie.id === Number(url.pathname.split('/').pop()));
      else if (url.pathname === '/api/auth/login') data = { accessToken: 'qa-transport-token', user };
      else if (url.pathname === '/api/auth/me') {
        assert.equal(req.headers().authorization, 'Bearer qa-transport-token');
        data = user;
      } else if (url.pathname.includes('/playback/')) data = [];
      else throw new Error(`Unexpected endpoint ${url.pathname}`);
      const failed = (errorGenres && url.pathname === '/api/genres') || (errorMovies && url.pathname === '/api/genres/1/movies');
      await route.fulfill({ status: failed ? 503 : 200, contentType: 'application/json', body: JSON.stringify(data) });
    });
    try {
      await page.goto('http://localhost:5182/genre/1');
      await page.getByRole('heading', { name: 'Hành động', exact: true }).waitFor();
      await page.locator('[data-testid^="movie-card-"]').first().waitFor();
      if (mode === 'A') assert.equal(calls.length, 0, 'production full mock must not call real APIs');
      else {
        assert.ok(calls.includes('GET /api/genres'));
        assert.ok(calls.includes('GET /api/genres/1/movies'));
        assert.equal(await page.locator('[data-testid^="movie-card-"]').count(), 12);
        await page.getByTestId('genre-page-next').click();
        await page.waitForURL('**page=2**');
        await page.getByTestId('movie-card-13').waitFor();
        await page.reload();
        await page.getByTestId('movie-card-13').waitFor();
        await page.getByRole('navigation', { name: 'Thể loại', exact: true }).getByRole('link', { name: 'Khoa học viễn tưởng', exact: true }).click();
        await page.getByText('Chưa có phim thuộc thể loại Khoa học viễn tưởng.', { exact: true }).waitFor();
        errorGenres = true;
        await page.reload();
        await page.getByRole('heading', { name: 'Không thể tải thể loại', exact: true }).waitFor();
        await page.getByText('Lỗi thể loại thử nghiệm', { exact: true }).waitFor();
        errorGenres = false;
        await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
        await page.getByRole('heading', { name: 'Khoa học viễn tưởng', exact: true }).waitFor();
        errorMovies = true;
        await page.goto('http://localhost:5182/genre/1');
        await page.reload();
        await page.getByText('Không thể tải phim thử nghiệm.', { exact: true }).waitFor();
        errorMovies = false;
        await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
        await page.getByTestId('movie-card-1').waitFor();
      }
      await page.goto('http://localhost:5182/login');
      await page.getByTestId('login-email').fill(mode === 'C' ? 'qa@streamly.test' : 'user@streamly.test');
      await page.getByTestId('login-password').fill('Streamly123!');
      await page.getByTestId('login-submit').click();
      await page.waitForURL('http://localhost:5182/');
      await page.goto('http://localhost:5182/movie/2');
      await page.getByTestId('detail-actions').getByTestId('my-list-button').click();
      await page.getByTestId('detail-actions').getByRole('button', { name: 'Xóa khỏi danh sách', exact: true }).waitFor();
      await page.goto('http://localhost:5182/my-list');
      await page.getByTestId('movie-card-2').waitFor();
      await page.reload();
      await page.getByTestId('movie-card-2').waitFor();
      if (mode === 'C') {
        assert.ok(calls.includes('POST /api/auth/login'));
        assert.ok(calls.includes('GET /api/auth/me'));
      } else assert.equal(calls.some((call) => call.includes('/auth/')), false);
      assert.deepEqual(errors, []);
      console.log(`PASS production mode ${mode}: genres, API dispatch, auth, My List, refresh${mode === 'A' ? '' : ', paging, empty, error+retry (simulated HTTP transport)'}`);
    } finally {
      await context.close();
      await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
    }
  }
} finally { await browser.close(); }
