# Phase 5 — Admin Layout & Movie Management List

Ngôn ngữ UI: English. Đã đọc `AGENTS.md`, PRD, kiến trúc, contract thật, báo cáo Phase 4 và proposal trước khi sửa mã. `vite.config.ts` vẫn khóa `localhost:5173` với `strictPort: true`.

## Tệp tạo và thay đổi

- Mới: `src/api/admin.api.ts`, `src/components/admin/AdminLayout.tsx`, `AdminSidebar.tsx`, `DataTable.tsx`, `src/features/admin/hooks.ts`, `movieColumns.tsx`, `movieFilters.ts`, `components/AdminMoviesManager.tsx`, `src/features/movies/mockMovieStore.ts`, `docs/phase5-report.md`.
- Sửa: `src/types/movie.ts`, `src/api/movies.api.ts`, `src/lib/queryKeys.ts`, `src/routes/AppRouter.tsx`, các trang `src/pages/admin/*`, `docs/proposed-api.md`, `docs/testids.md`.
- Xóa placeholder dashboard cũ `src/pages/admin/AdminDashboardPage.tsx`; `/admin` hiện chuyển thẳng tới `/admin/movies`.

## Audit và kiến trúc

`vite` chạy cổng 5173 strict. Bộ lọc public duy nhất là `selectPublicMovies` trong `src/features/movies/selectors.ts`; admin không dùng selector này nên thấy cả phim ẩn. Trước Phase 5, mock phim là mảng seed bất biến `mockMovies`. `mockMovieStore.ts` hiện phủ overrides và deletion IDs từ localStorage lên seed, giữ nguyên thứ tự và numeric IDs. `moviesApi`, Admin API, Search, Detail, Similar, History và My List đều đi qua nguồn chung. Reset chỉ xóa hai khóa override/deletion và trả catalog về seed.

`UpdateMovieRequest` được định nghĩa một lần từ đúng subset có thể sửa của `Movie`. Real branch dùng GET `/movies`, PUT `/movies/{id}`, DELETE `/movies/{id}`. Visibility và Featured đọc bản ghi hiện tại rồi gửi full editable body với một trường thay đổi. Đây là giả định được cô lập trong `admin.api.ts` và ghi rõ trong proposal.

Admin routes và layout đều dùng `React.lazy` + `Suspense`; public routes vẫn eager như trước. `AdminRoute` giữ nguyên và có comment nhắc đây chỉ là UX. Layout riêng không có Navbar/Footer public. Genres/Users và Add/Edit vẫn là placeholder “Coming soon” trong shell admin.

Build Phase 4: main JS 599.35 kB (gzip 192.41 kB), CSS 26.62 kB. Build Phase 5: main JS 601.29 kB (gzip 193.43 kB), CSS 28.74 kB; các chunk lazy gồm AdminLayout 4.40 kB, AdminMoviesPage 69.64 kB, Edit 0.64 kB, Genres/Users 0.36 kB mỗi file. Phần bảng/admin lớn không nằm trong initial admin-free navigation; main tăng nhẹ vì public movie API dùng mutable store chung.

## Component API

- `AdminLayout`: không nhận props; tự lấy route, user và render `<Outlet />`.
- `AdminSidebar`: `onNavigate?: () => void`, `testId?: string`.
- `DataTable<TData>`: `data`, `columns`, `sorting`, `onSortingChange`, `pagination`, `onPaginationChange`, `getRowId`, `renderMobileCard`; tùy chọn `isLoading`, `error`, `onRetry`, `emptyMessage`, `testId`.

## Proposal API

`docs/proposed-api.md` có phần Admin Movies, vẫn đánh dấu **PROPOSED — NOT AGREED WITH BACKEND**: full `UpdateMovieRequest` cho PUT, DELETE trả 200/204 và 404 message, lỗi 400/404/409, cùng câu hỏi liệu GET `/api/movies` có trả phim ẩn hay cần `includeHidden=true`. Backend vẫn cần xác nhận partial/full PUT và có cần `id` trong body hay không.

## Kết quả kiểm thử

- `npm run dev`: pass tại `http://localhost:5173`; `npx tsc --noEmit`: pass; `npm run build`: pass; `git diff --check`: pass (chỉ có cảnh báo Git LF/CRLF).
- Guard: Guest `/admin` → `/login`; seeded User bị chuyển về `/`; seeded Admin vào được và `/admin` → `/admin/movies`.
- Danh sách ban đầu: 32 total, 31 visible, 1 hidden, 2 featured. Admin thấy phim ẩn. Search debounce trả đúng 1 phim cho “Interstellar”. Visibility/featured/trailer filter và tổ hợp no-results hoạt động.
- Sort Title cập nhật URL và `aria-sort=ascending`. Page size 20, Next đổi URL sang `page=2` và hiện “21-32 of 32”. URL filter/sort/page giữ qua F5; Back/Forward khôi phục đúng filter.
- Hide Interstellar: UI optimistic có `aria-busy`, Search public trả 0 và `/movie/2` thành 404; bật lại thì Detail trở lại. Mô phỏng 409 rồi hoàn nguyên xác nhận rollback về Visible và hiển thị backend message, không có lỗi console.
- Bỏ featured Interstellar làm Hero đổi sang Shadow Realm Chronicles; Reset demo đưa Hero và seed trở lại.
- Delete The Dark Sentinel: Cancel và Esc giữ dòng; Confirm khóa nút khi loading và xóa dòng. Phim biến mất khỏi Detail, My List và History của cả User lẫn Admin. Reset demo đưa catalog về 32 phim. Stale personalized IDs được API My List/History tự loại bỏ.
- Error list được mô phỏng rồi hoàn nguyên: hiện normalized message, nút Retry tải lại thành công. Loading skeleton và no-results state đã thấy trên browser.
- Responsive: 375 px dùng `ARTICLE` card, drawer mở bằng toggle và đóng bằng Esc; 1440 px dùng `TR`; 375/768/1440 không có horizontal page overflow. Nút/action/filter dùng bàn phím; ConfirmDialog trap focus qua Modal hiện có. Genres/Users/Add/Edit placeholder vẫn nằm trong layout.
- Tất cả test ID Phase 5 có trong source và `docs/testids.md`. Browser console không có error/warning/unhandled rejection sau kiểm thử cuối.

## Chưa xác minh và câu hỏi mở

- Backend tại `http://localhost:5000/api/movies` timeout, nên real-mode GET chưa xác minh. PUT/DELETE không được gọi vì chưa có xác nhận safe test database.
- Chưa kiểm thử Safari/Firefox hoặc thiết bị cảm ứng thật. Bundle chính vẫn có cảnh báo >500 kB đã biết; không xử lý trong phase này theo yêu cầu.
- Backend cần xác nhận full/partial PUT, `id` trong body, quyền admin thật, GET có trả hidden hay endpoint/query riêng, và status/body chính xác của DELETE.

Phase đề xuất tiếp theo: Phase 6 — Add/Edit Movie form và TMDB import flow, sau khi chốt request body và admin-list behavior với backend.
