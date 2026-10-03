# Báo cáo Phase 1: Design System & Home

Đã đọc AGENTS.md (có tồn tại), 01-PRD.md và 02-Tech-Stack-Architecture.md trước khi viết mã. Không cài dependency mới. Không triển khai các trang của Phase 2.

## 1. File tạo/sửa

| File | Thay đổi |
|---|---|
| `.gitignore` | Tạo; bỏ qua `.env`, biến thể env, node_modules, dist, tsbuildinfo; giữ `.env.example`. |
| `.env.example` | Giữ URL backend mẫu, thêm `VITE_USE_MOCK=true`; không chứa secret. |
| `src/vite-env.d.ts` | Khai báo kiểu cờ mock. |
| `src/lib/constants.ts` | Cờ mock mặc định true và khóa token dùng chung; tránh import vòng store/client. |
| `src/api/client.ts` | 401 xóa auth trong store và localStorage, redirect login một lần; không redirect lại khi đang ở login. |
| `src/store/useAuthStore.ts` | Chỉ đổi nơi import khóa token; giữ hydration đồng bộ và các thao tác auth. |
| `src/api/auth.api.ts` | Thêm nhánh Axios khi mock=false; giữ mock login/register hiện có. |
| `src/api/movies.api.ts` | Nhánh Axios cho từng hàm; bỏ genres khỏi module; dùng overview. |
| `src/api/genres.api.ts` | Module genres riêng, hỗ trợ mock/real. |
| `src/api/index.ts` | Export genres API. |
| `src/types/movie.ts` | Chuẩn hóa overview, runtime, posterPath, backdropPath, trailerKey nullable theo Step 0. |
| `src/features/movies/mockMovies.ts` | 32 phim, 8 genres, mỗi genre 8 phim; ảnh Picsum theo slug; trailer nullable. |
| `src/lib/image.ts` | URL tuyệt đối giữ nguyên; đường dẫn TMDB ghép theo size; null/đường dẫn không hợp lệ trả null. |
| `src/components/ui/SmartImage.tsx` | Lazy-load, skeleton, fallback; hero tải eager; reset trạng thái khi URL đổi. |
| `tailwind.config.js` | Typography hero/section/body/caption/metadata; gutter, radius và shadows. |
| `src/index.css` | Focus-visible, overlay dùng tokens, scrollbar utility, responsive carousel, hover 300ms/scale 1.24, reduced motion. |
| `src/App.tsx` | Toast dùng class từ tokens, bỏ màu inline. |
| `src/components/layout/Navbar.tsx` | Navbar cuộn, search, guest/user/admin menu, mobile menu, sign out. |
| `src/components/layout/Footer.tsx` | Footer và nguyên văn TMDB attribution. |
| `src/components/layout/MainLayout.tsx` | Navbar, main/Outlet, Footer, skip link, reset scroll khi đổi pathname. |
| `src/components/layout/PageContainer.tsx` | main thành div để không lồng hai main sau khi thêm MainLayout. |
| `src/components/movie/MovieCard.tsx` | Card backdrop, panel metadata/actions, toast stub, null trailer. |
| `src/components/carousel/Carousel.tsx` | Embla dragFree/align start, arrows, phím mũi tên; tâm scale theo mép đang nhìn thấy. |
| `src/components/movie/MovieRow.tsx` | Skeleton/error/retry; ẩn hàng khi dữ liệu rỗng. |
| `src/components/hero/HeroBanner.tsx` | Hero và loading/error/empty/no-trailer states. |
| `src/lib/queryKeys.ts` | Query keys tập trung. |
| `src/features/movies/hooks/index.ts` | Featured, trending, new, by-genre và genres hooks. |
| `src/pages/HomePage.tsx` | Hero + Trending Now + Newly Added + 8 hàng genre; mỗi hàng tự tải. |
| `src/routes/AppRouter.tsx` | Chỉ thêm route layout bao public/user theo Step 9; giữ path và guards. |
| `tests/phase1.html`, `tests/phase1.tsx` | Trang kiểm thử dev độc lập, không được import vào app/build production. |
| `docs/phase1-desktop.jpg`, `docs/phase1-mobile.jpg` | Ảnh xác minh giao diện. |

## 2. Audit Phase 0

- Thiếu `.gitignore`: đã tạo. `.env.example` có sẵn, không có secret.
- Auth hydration vốn đồng bộ: giữ nguyên; đã thử session User và refresh `/profile` thành công.
- ProtectedRoute vốn redirect `/login` với `state.from`: giữ nguyên; đã thử guest `/my-list` về login. `state.from` xác minh từ mã nguồn.
- AdminRoute vốn chặn User về `/`: giữ nguyên; đã thử trên trình duyệt. Guest vẫn về login theo guard hiện có.
- Interceptor 401 trước đây chỉ xóa token: nay xóa cả user/token và auth trong bộ nhớ; chống redirect lặp/concurrent.
- Thêm mock/real switch mặc định true cho toàn bộ API functions hiện có.
- Tách genres API. Bộ mock trước có 6 phim, một số genre thiếu phim: nay 32 phim, 8 phim/genre.
- Thư mục hiện không phải Git repository, vì vậy chưa thể kiểm tra tracking hay tạo Git diff; quy tắc ignore đã ghi đúng file.

## 3. Component API

```ts
Navbar: không nhận props; đọc authStore và router.
Footer: không nhận props.
MovieCard: { movie: Movie }
Carousel: { children: ReactNode; label: string }
MovieRow: {
  title: string;
  movies?: Movie[]; // mặc định []
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}
HeroBanner: {
  movie?: Movie;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}
SmartImage: {
  path: string | null;
  alt: string;
  size?: string; // w780 mặc định
  className?: string;
  priority?: boolean; // eager cho hero
}
```

## 4. Kết quả kiểm thử

| Kiểm thử | Kết quả |
|---|---|
| `npm run dev -- --host localhost` | PASS, Vite chạy cổng 5173, HTTP 200. |
| `npx tsc --noEmit` | PASS. |
| `npm run build` | PASS, TypeScript project build và Vite build. |
| Home đầy đủ | PASS: Hero, Trending Now, Newly Added, 8 genre rows và footer. |
| Navbar scroll | PASS: computed background từ rgba(0,0,0,0) sang rgb(20,20,20). |
| Menu mobile | PASS: đóng/mở; User/Admin có đúng links; sign out trả guest. |
| Search submit | PASS: space & time -> `/search?q=space%20%26%20time`. |
| Carousel | PASS: drag, arrows và ArrowRight; nút Previous xuất hiện sau cuộn. |
| Card expansion | PASS: scale 1.24, panel hiển thị metadata; tăng padding viewport và điều chỉnh tâm scale để tránh clipping. |
| Actions | PASS: Hero Play -> `/watch/2`, More Info -> `/movie/2`; card -> `/movie/10`, card Play -> `/watch/12`; My List có toast Coming soon. |
| No trailer | PASS: Hero Shadow Realm Chronicles vẫn hiện và có ghi chú; không có Play. Card Paper Planets có Trailer unavailable. |
| Loading | PASS: test delay 1800ms hiển thị hero và row skeleton; Home reload cũng thấy skeleton. |
| Error + retry | PASS: ép lỗi query; Hero và row có ErrorState riêng; restore + Try Again tải lại thành công 8 cards. |
| Empty | PASS: Hero EmptyState; MovieRow không render. |
| SmartImage | PASS: ảnh Picsum tải được; null và ảnh hỏng chuyển fallback; helper cases PASS. |
| Responsive | PASS: 1440x900, 768x1024 và 375x812. Ở 375px, scrollWidth=360px (trừ scrollbar), không tràn ngang. |
| Auth | PASS: User giữ phiên sau refresh; User vào admin về `/`; menu Admin chỉ hiện đúng role; đăng xuất xóa phiên. |
| Axios 401 | PASS với adapter giả lập 401: tới `/login`, sau đó truy cập `/profile` vẫn bị chặn. Guard chống redirect khi đã ở login kiểm tra qua mã nguồn. |
| Console | Đã sửa warning fetchPriority của React 18; không phát sinh error mới sau sửa. Còn 2 cảnh báo future flags React Router v7 từ nền Phase 0. |
| Layout stability | Không thấy nhảy bố cục do ảnh trong các lượt kiểm tra; ảnh/card giữ aspect ratio, hero skeleton giữ chiều cao. Chưa đo CLS bằng PerformanceObserver/Lighthouse. |

Cách chạy lại kiểm thử trạng thái: mở `/tests/phase1.html` trong Vite dev. Chọn Force API error, chờ lỗi, chọn Restore API for retry rồi Try Again ở từng vùng. Test empty kiểm tra dữ liệu rỗng. Các nút session chỉ phục vụ fixture QA local; đã sign out sau kiểm thử.

## 5. Giới hạn và lựa chọn

- Không xoay hero tự động; dùng phim featured đầu tiên để giữ đơn giản.
- My List là toast stub đúng yêu cầu.
- Các trang detail/watch/search/login/register giữ nguyên placeholder Phase 0; chỉ xác minh điều hướng tới đúng route.
- Picsum là ảnh minh họa theo seed, không phải artwork thật của phim. Một số metadata và trailer keys kế thừa fixture Phase 0; chưa xác minh trailer YouTube vì playback thuộc Phase 2. Đã bỏ key Rickroll của fixture đầu tiên.
- Nhánh Axios chưa thử với backend thật. Các endpoint `/movies/featured`, `/movies/trending`, `/movies/new`, `/movies`, `/movies/:id`, `/movies/:id/similar`, `/genres`, `/auth/*` cần đối chiếu API Spec khi backend sẵn sàng.
- Đã kiểm tra responsive bằng viewport trong Chromium; chưa kiểm thử thiết bị cảm ứng thật, Safari/Firefox hay thiết lập reduced-motion của hệ điều hành. CSS chặn hover expansion trên pointer coarse và tắt animation/scale khi reduced-motion.
- Không có thư viện mới; chưa triển khai tính năng Phase 2.

## 6. Phase tiếp theo

Movie Detail, trailer modal/embed YouTube (gồm trạng thái không trailer), Search với suggestions, và Genre page. Tiếp tục tái sử dụng hooks, SmartImage, MovieCard, queryKeys và API boundary đã tạo.
