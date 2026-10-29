# Streamly UI upgrade — 2026-10-29

## Phạm vi và quy trình

Đọc AGENTS, PRD, Architecture, Contract và docs trước khi sửa. Báo cáo khám phá và kế hoạch animation được trình bày trong chat trước khi thay đổi code. Thực hiện A → B → C → nghiệm thu, có tóm tắt từng giai đoạn. Không thêm dependency, không sửa backend, không gọi TMDB API, không thêm `any`.

Repo hiện không có `.git`, vì vậy không tạo được Git diff/commit. Các ảnh và bản build QA sinh ra nằm trong `tests/artifacts/`, được gitignore. Không thay đổi `.env` hiện có.

## A — Nguyên nhân và cách sửa layout

Layout cũ dùng `min-h-[70svh]` lồng nhau, `items-end` trên mobile / `lg:items-center` trên desktop và chiều cao nội dung tự do. Mô tả/tiêu đề dài làm cả khối đổi vị trí, kéo nút và phần gợi ý xuống. Skeleton cũng không khớp layout thật. Diễn viên có/không có làm phần gợi ý bắt đầu khác nhau.

Layout mới neo grid ở cùng padding-top; hero có chiều cao phụ thuộc viewport với mức tối thiểu theo breakpoint. Các ô title, metadata, overview có chiều cao xác định; nút ở hàng riêng. Title giới hạn 2 dòng desktop, 3 dòng mobile/tablet và giữ tiêu đề đầy đủ qua thuộc tính `title`; overview tối đa 4 dòng. “Xem thêm” mở Modal có focus trap, Esc và “Thu gọn”, nên không đẩy hero. Metadata quá nhiều có thể cuộn trong ô dành sẵn. Có fallback cho overview, poster, năm, thời lượng, rating và genres. Poster có mặt trên mobile. Phần gợi ý luôn nằm ngay sau hero; diễn viên ở phía dưới.

Đo trước sửa bằng `node tests/ui-regression.mjs --baseline` đã thất bại đúng lỗi: desktop action lệch 2.017 px (2017px). Sau sửa, với viewport cao 900px:

| Viewport | Poster/title Y | Nút Xem Y | Gợi ý Y | Chênh giữa 5 phim |
|---|---:|---:|---:|---:|
| 1440 / 1280 | 174 | 562 | 824 | 0px |
| 768 | 174 | 654 | 824 | 0px |
| 375 | 174 | 602 | 932 | 0px |

5 phim gồm mô tả rất ngắn, mô tả rất dài, tiêu đề rất dài, dữ liệu thiếu và bản ghi thông thường. Fixture được tạo trong localStorage của browser QA riêng, không thay seed của ứng dụng. Screenshot trước/sau: `tests/artifacts/before-{width}-{id}.png` và `after-{width}-{id}.png`; số đo trong `before-layout.json` / `after-layout.json`.

## B — Lọc thể loại

Luồng: Navbar/GenrePage → `useGenres` / `useMoviesByGenre` → `moviesApi.getGenres` / `getMoviesByGenre` → API genres hiện có → mock hoặc Axios. Giữ module `genres.api.ts` để không phá các consumer admin; movies API ủy quyền sang module này.

Real endpoints giữ nguyên `/api/genres` và `/api/genres/{id}/movies`. ID lấy từ dữ liệu backend, không suy từ tên hoặc TMDB ID. Tên tiếng Anh phổ biến được chuyển sang tiếng Việt tại API boundary; tên chưa có bản dịch giữ nguyên. Mock đã có tên Việt.

`/genre/:id?page=2&pageSize=12` giữ trang khi refresh/Back/Forward. Chuyển chip bắt đầu ở trang 1, giữ pageSize; giá trị sai và trang vượt giới hạn được chuẩn hóa. Dùng lại MovieGrid/MovieCard, EmptyState, ErrorState + retry và Skeleton. Chia trang bằng `paginate()` ở feature hook, trả `{ items, page, pageSize, totalItems, totalPages }`. Không tự gửi query phân trang chưa được backend thống nhất; backend hiện trả mảng.

Dropdown desktop và menu mobile dùng dữ liệu hook/cache, hỗ trợ Enter/Tab/Esc, các phím mũi tên/Home/End trong popup, aria-expanded/aria-haspopup, focus-visible, đóng khi ra ngoài và trả focus khi Esc. Active indicator chạy giữa Trang chủ / Thể loại / My List. Badge trên detail dẫn đến genre route.

Lưu ý tài liệu: `03-FE-BE-Contract.md` vẫn là v1.0, ghi genres/auth chưa có. Changelog/handoff mô tả các endpoint mới hơn và code đã có sẵn. Task giữ các endpoint hiện có; không tự sửa contract. GET thật đã xác nhận genres/movies trả mảng. Cần backend cập nhật tài liệu nguồn.

## C — Animation và cách chỉnh/tắt

Framer Motion sẵn có + CSS; không GSAP hoặc thư viện mới.

| Vùng | Hiệu ứng | Chỉnh ở đâu |
|---|---|---|
| Card | translateY(-3px), scale 1.05, poster zoom 1.025, gradient/title/year/rating/play, bóng mềm | `index.css`, MovieCard |
| Nút / chip / arrows | Màu mượt, active scale .97, icon dịch 2px | `index.css`, Button/IconButton |
| Navbar | Nền blur hiện bằng opacity; indicator chia sẻ layoutId; popup fade/slide 6px | Navbar, NavItem, GenreMenu |
| Hàng phim | Title và card reveal 12px, opacity; stagger tối đa 175ms, chạy một lần | Reveal, MovieRow |
| Home hero | Parallax tối đa 28px, opacity 1 → .65 theo scroll | HeroBanner |
| Detail | Poster → title → metadata → mô tả → actions, giữ ô grid | MovieDetail, Reveal |
| Route | Fade vào 140ms; không chờ exit, không đổi guards | MainLayout |
| Modal | AnimatePresence, fade/scale/translate ngắn | Modal |
| Skeleton | Shimmer qua transform của pseudo-element | Skeleton, index.css |

`src/lib/motion.ts`: fast .16s, enter .32s, route .14s, stagger .035s và easing. CSS interaction token `--motion-fast` / `--motion-ease` tại `:root` của `index.css`; scale/parallax có giá trị ngay tại các selector/component trên. Thay các token/giá trị này để tinh chỉnh. Bật “Reduce motion” trong hệ điều hành hoặc emulate `prefers-reduced-motion: reduce` để tắt parallax, reveal dịch chuyển/stagger, scale và shimmer. MotionConfig, useReducedMotion và media query cùng áp dụng.

Chỉ transform/opacity thay đổi vị trí qua animation; CSS màu phản hồi hover riêng. Không animate width/height/top/left. Embla giữ transform của track; Reveal nằm bên trong slide. Trên touch, play và My List có nút trực tiếp, không phụ thuộc hover. My List/History giữ action riêng trong MovieGrid, tránh trùng nút khi tái dùng card.

## Env và watch

Sửa lỗi production ép mọi mock flag thành false và bỏ qua VITE_API_URL. Hiện cả dev/build đều đọc bốn biến trong README; bổ sung `.env.example` bị thiếu. Không đổi Axios interceptor hoặc auth store.

Mock playback trả nguồn rỗng qua API module, không gọi backend. WatchPage dùng YouTube trailer nếu không có nguồn phát và có trailerKey; thiếu cả hai vẫn có trạng thái chưa có nguồn. Luồng nguồn phát thật có sẵn được giữ nguyên. Detail có nút trailer modal riêng, disabled khi thiếu key, và vẫn giữ nút Xem đến `/watch/:id`.

## Kiểm thử có thể chạy lại

Các script dùng Playwright có sẵn trong bundled runtime, Chrome cài trên máy; không thêm package. Có thể đặt `PLAYWRIGHT_MODULE` thành đường dẫn `playwright/index.mjs` khác. Mỗi script tạo Vite riêng, profile/localStorage browser riêng và tự đóng khi xong; không dừng dev server 5173 đang mở.

```powershell
npm run typecheck
npm run build
node tests/ui-regression.mjs
node tests/flows.mjs
node tests/motion.mjs
node tests/env-modes.mjs
$env:LIVE_API_URL='https://your-backend-host'
node tests/live-read.mjs
```

| Kiểm thử | Kết quả |
|---|---|
| TypeScript / production build | PASS; cảnh báo chunk HLS >500kB có từ trước |
| 5 phim × 4 viewport, poster/title/actions/recommendations | PASS, vị trí bằng nhau, không tràn ngang |
| Dropdown, keyboard, chip, badge, invalid genre | PASS tại 1440/768/375 |
| Pagination/pageSize/refresh/Back/Forward, trang quá giới hạn | PASS; thêm đủ bản ghi QA để qua nhiều trang |
| Auth guest → login → trở lại detail, My List add/remove/F5 | PASS với mock auth tại desktop/tablet/mobile |
| Search suggestions → results → detail | PASS |
| Xem / Quay lại / trailer modal / Esc / no-trailer | PASS; embed URL đúng, YouTube content được stub trong QA |
| Embla ArrowRight + drag, hover không dịch card cạnh bên | PASS |
| Reduced motion, normal motion, touch controls | PASS |
| Loading skeleton, empty, lỗi genres/movies + retry | PASS; HTTP lỗi được inject trong transport QA |
| CLS trang chi tiết | 0 trong phép đo fixture desktop/mobile, animation bật |
| Console/page errors trong các luồng thường | Không có |
| Build A | Full mock đúng, không gọi real API |
| Build B/C với HTTP transport giả lập | PASS genres, paging, auth, Bearer /auth/me, My List và refresh |
| Backend thật B | PASS genres/detail/search/refresh/guest guard/mock auth/My List |
| Backend thật C | PASS guest genres/detail/search/refresh/guard; chưa thử real login |

Live GET trả 16 thể loại và 9 phim khi kiểm tra. Backend cho CORS `http://localhost:5173`, không cho origin QA 5183. Script live phục vụ frontend production qua routing riêng trong browser ở origin 5173, không sửa/giả lập response backend; backend vẫn nhận GET/OPTIONS trực tiếp, mọi method ghi bị chặn trong script live. Không sử dụng tài khoản mock để đăng nhập backend thật.

## Danh sách file thay đổi/thêm

- Cấu hình: `.env.example` (mới), `.gitignore`, `src/lib/constants.ts`, `src/api/client.ts`.
- API/types helper: `src/api/movies.api.ts`, `src/api/genres.api.ts`, `src/api/playback.api.ts`, `src/mocks/genres/api.ts`, `src/mocks/playback/api.ts` (mới), `src/lib/genre.ts` (mới). Không đổi shape Movie/Genre.
- Feature: `src/features/movies/hooks/index.ts`, `components/MovieDetail.tsx`, `components/MovieDetailSkeleton.tsx`, `components/GenreMenu.tsx` (mới), các đường dẫn component đều dưới `src/features/movies/`.
- Pages/routes: `src/pages/MovieDetailPage.tsx`, `src/pages/GenrePage.tsx`, `src/pages/WatchPage.tsx`, `src/routes/AppRouter.tsx`.
- Layout/hero: `src/components/layout/Navbar.tsx`, `MainLayout.tsx`, `NavItem.tsx` (mới), `src/components/hero/HeroBanner.tsx`.
- Movie UI: `src/components/movie/MovieCard.tsx`, `MovieGrid.tsx`, `MovieRow.tsx`.
- Motion/UI: `src/App.tsx`, `src/index.css`, `src/lib/motion.ts` (mới), `src/components/ui/Reveal.tsx` (mới), `Button.tsx`, `IconButton.tsx`, `src/components/feedback/Skeleton.tsx`, `src/components/modal/Modal.tsx`.
- QA: `tests/ui-regression.mjs`, `flows.mjs`, `motion.mjs`, `env-modes.mjs`, `live-read.mjs` (đều mới).
- Tài liệu: `README.md`, `docs/testids.md`, báo cáo này.

## Giới hạn và đề xuất tiếp theo

- Chưa có tài khoản real test để kiểm thử C đăng nhập/phiên/401 end-to-end. Transport giả lập xác minh đường đi và Bearer header; không thay thế nghiệm thu auth backend thật.
- Chưa thử Safari/Firefox hoặc thiết bị cảm ứng vật lý; touch được emulate trong Chrome. Playback YouTube bên ngoài được kiểm tra embed/fallback, không chứng minh video thực phát trên mọi mạng.
- Ảnh/font được thay bằng fixture ở QA để phép đo ổn định; CLS=0 áp dụng cho phép đo này, không phải chứng nhận hiệu năng toàn site thực tế.
- Pagination vẫn phía client theo workaround hiện hành. Chuyển sang server paging khi backend có contract thống nhất; không cần sửa component.
- Cập nhật Contract v1.0 theo endpoint backend thật và đồng bộ tài liệu nguồn là việc tiếp theo. Sau đó nghiệm thu auth C với tài khoản riêng và cân nhắc xử lý chunk HLS lớn nếu có nhu cầu hiệu năng.
