# Báo cáo Phase 3 — Auth UI & My List

Ngày kiểm tra: 2026-10-03. UI tiếp tục dùng English.

## 1. Tệp tạo mới/thay đổi

Tạo mới:

- `docs/proposed-api.md`, `docs/testids.md`
- `src/features/auth/mockAuth.ts`, `schemas.ts`
- `src/features/auth/components/LoginForm.tsx`, `RegisterForm.tsx`, `PasswordField.tsx`
- `src/api/myList.api.ts`
- `src/features/my-list/hooks/index.ts`
- `src/components/movie/MyListButton.tsx`
- `src/routes/GuestRoute.tsx`
- `src/lib/navigation.ts`

Thay đổi:

- `.env.example`, `vite.config.ts`, `tsconfig.node.json`, `package.json`
- `src/types/user.ts`, `src/types/auth.ts`
- `src/api/auth.api.ts`, `src/api/client.ts`
- `src/store/useAuthStore.ts`, `src/App.tsx`, `src/routes/AppRouter.tsx`, `src/routes/AdminRoute.tsx`
- `src/pages/LoginPage.tsx`, `RegisterPage.tsx`, `MyListPage.tsx`
- `src/components/layout/Navbar.tsx`, `src/components/movie/MovieCard.tsx`, `MovieGrid.tsx`
- `src/features/movies/components/MovieDetail.tsx`, `src/lib/queryKeys.ts`

Đã xóa `tests/phase1.tsx` vì đây là màn QA thủ công cho loading/error/empty của Phase 1, không được npm script nào chạy và không được tài liệu hóa. Nó vốn đã nằm ngoài production bundle do `tsconfig.json` chỉ include `src`.

Đã xóa `vite.config.js` và `vite.config.d.ts` sinh cũ vì `vite.config.js` che khuất cấu hình TypeScript. Output của `tsconfig.node.json` nay đi vào thư mục ignored trong `node_modules`.

## 2. Kiến trúc Auth

- `VITE_USE_MOCK` chỉ điều khiển movie/genre/similar.
- `VITE_USE_MOCK_AUTH` điều khiển Auth và My List độc lập, mặc định `true`.
- Khi auth mock tắt, frontend không gọi endpoint chưa tồn tại; API trả trạng thái unavailable có kiểu chuẩn hóa.
- Tài khoản đăng ký mock được lưu trong mock layer. Zustand chỉ giữ session hiện tại và hydrate đồng bộ từ localStorage.
- My List nằm trong TanStack Query, cache key theo user id, lưu mock theo user và lấy movie qua `moviesApi`, nên có thể dùng real movies cùng mock auth khi backend movie reachable.
- Interceptor bỏ qua 401 từ login/register. 401 ngoài auth xóa session, toast `Session expired`, chuyển `/login` với `state.from`; 403 chỉ toast thông báo không có quyền.
- Sign out xóa auth và toàn bộ personalized My List query cache.

## 3. Component props

- `LoginForm`: `returnTo?: string`
- `RegisterForm`: `returnTo?: string`
- `MyListButton`: `movie: MovieDetail`, `variant?: 'icon' | 'full'`, `className?: string`

## 4. Proposed API

`docs/proposed-api.md` được đánh dấu **PROPOSED — NOT AGREED WITH BACKEND** và đề xuất:

- `POST /auth/register`, `POST /auth/login` → `AuthResponse`
- `GET /my-list` → `Movie[]`
- `POST /my-list` với `{ movieId }`
- `DELETE /my-list/{movieId}`
- Lỗi `{ message }` hoặc `{ message, errors }`; status 400, 401, 403, 409.

## 5. Kết quả kiểm thử

- `npm run dev`: pass tại `http://localhost:5173`; chạy lần hai thất bại ngay vì `strictPort`, không tự chuyển cổng.
- `npx tsc --noEmit`: pass, exit code 0.
- `npm run build`: pass, 2.128 modules. JS 587.80 kB (gzip 188.99 kB), CSS 25.88 kB (gzip 5.92 kB).
- Login sai: hiển thị `Incorrect email or password.`, vẫn ở `/login`, không redirect/loop. Double-click chỉ tạo một trạng thái submit do nút bị disabled/loading.
- Login đúng từ `/my-list`: quay lại `/my-list`.
- Register: client validation, duplicate seeded email 409 và đăng ký thành công đều đã kiểm tra.
- F5 giữ session; GuestRoute chuyển user đã đăng nhập khỏi `/login`; sign out xóa session và từ protected route quay về `/`.
- User và Admin có My List riêng: User giữ movie 2, Admin giữ movie 3; không nhìn thấy dữ liệu của nhau.
- Add/remove đã kiểm tra ở MovieCard, Movie Detail và My List page. F5 giữ danh sách.
- Optimistic remove làm card biến mất ngay. Đã ép mock mutation lỗi tạm thời: cache rollback về trạng thái trước và hiện toast lỗi; mã ép lỗi đã được hoàn nguyên.
- Đã ép lỗi tải My List hai lần: ErrorState và Try Again xuất hiện; retry thủ công phục hồi danh sách; mã ép lỗi đã được hoàn nguyên.
- Guest bấm My List được chuyển đến login với toast và quay lại đúng movie detail sau login.
- Seeded User bị chuyển khỏi `/admin`; seeded Admin truy cập được và Navbar có Admin link.
- Keyboard-only login hoạt động; Tab chuyển từ email đến password. Card My List button nhận focus và có accessible label; focus-visible dùng style toàn cục.
- 375, 768 và 1440 px: Login và My List có `scrollWidth === clientWidth`, không tràn ngang.
- Các test id Login/Register/My List hiện diện và `docs/testids.md` liệt kê toàn bộ 25 vị trí test id hiện có.
- Console cuối: không có error, warning hoặc unhandled promise rejection.

Không có backend URL reachable, nên real movies + mock auth chưa được xác minh. Cũng chưa kiểm thử Safari, Firefox hoặc thiết bị cảm ứng thật. Luồng interceptor với 401/403 thật chưa thể kiểm thử vì backend chưa có Auth.

## 6. Giới hạn

- Build thành công nhưng Vite cảnh báo entry chunk 587.80 kB; nên code-split route ở phase tối ưu hóa sau.
- Token tiếp tục nằm trong localStorage theo quyết định kiến trúc của đồ án.
- Script `npm run lint` đã bị xóa vì ESLint không được cài và yêu cầu phase này không cho thêm dependency.

## 7. Phase tiếp theo đề xuất

Tiếp theo nên làm Watch History và Profile trên mock domain riêng, ghi proposed contract trước khi triển khai. Sau đó mới chuyển sang Admin UI và tích hợp quyền thật khi backend có Auth/JWT.
