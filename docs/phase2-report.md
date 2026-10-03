# Báo cáo Phase 2 — Movie Detail, Trailer, Search, Genre, Watch

Ngày kiểm tra: 2026-10-03. Ngôn ngữ UI: English, giữ nguyên lựa chọn của Phase 1.5.

## 1. Tệp được tạo/thay đổi

Tạo mới:

- `src/components/modal/Modal.tsx`, `TrailerModal.tsx`
- `src/components/movie/TrailerPlayer.tsx`, `SearchBar.tsx`, `MovieGrid.tsx`
- `src/components/ui/Badge.tsx`
- `src/features/movies/components/MovieDetail.tsx`, `MovieDetailSkeleton.tsx`
- `src/hooks/useDebounce.ts`

Thay đổi:

- `src/App.tsx`: bật React Router future flags.
- `src/components/layout/Navbar.tsx`: dùng `SearchBar` chung.
- `src/components/layout/MainLayout.tsx`: ẩn Navbar/Footer trên `/watch/:id`, giữ scroll-to-top.
- `src/features/movies/hooks/index.ts`, `src/lib/queryKeys.ts`: detail/search/genre/similar hooks và query keys; 404 không retry.
- `src/api/movies.api.ts`: thông báo 404 theo ngôn ngữ UI.
- `src/pages/MovieDetailPage.tsx`, `SearchPage.tsx`, `GenrePage.tsx`, `WatchPage.tsx`: hoàn thiện các flow Phase 2.

## 2. Types cuối cùng

```ts
interface Movie {
  id: number;
  tmdbId: number;
  title: string;
  overview?: string | null;
  releaseDate?: string | null;
  durationMinutes?: number | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  trailerKey?: string | null;
  isVisible: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

type MovieDetail = Movie & {
  genres?: Genre[];
  cast?: CastMember[];
  rating?: number | null;
};

interface Genre {
  id: number;
  name: string;
  slug?: string;
  movieCount?: number;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profileUrl?: string;
}
```

`genres`, `cast`, `rating` vẫn là dữ liệu mở rộng chỉ có ở mock cho đến khi backend bổ sung.

## 3. Component API

- `Modal`: `isOpen`, `onClose`, `title`, `children`.
- `TrailerPlayer`: `trailerKey?`, `title`, `autoPlay?`.
- `TrailerModal`: `isOpen`, `onClose`, `trailerKey?`, `title`.
- `SearchBar`: `initialValue?`, `autoFocus?`, `compact?`, `onSubmit?`.
- `MovieGrid`: `movies?`, `isLoading?`, `error?`, `onRetry?`, `emptyMessage?`.
- `MovieDetail`: `movie`.

## 4. Kết quả kiểm thử

- `npm run dev`: chạy tại `http://localhost:5175`, HMR hoạt động.
- `npx tsc --noEmit`: pass, exit code 0.
- `npm run build`: pass; 2,104 modules; JS 481.36 kB (gzip 159.08 kB), CSS 25.29 kB (gzip 5.81 kB).
- Home → card → detail hoạt động; Hero Play là `/watch/2`, More Info là `/movie/2`.
- Modal trailer mở đúng; `Esc` đóng; focus trap giữ focus trong dialog; focus trả về `watch-trailer-button`; body scroll được khôi phục; modal bị xóa khỏi DOM sau exit.
- Movie `trailerKey = null`: nút trailer disabled, có giải thích; `/watch/:id` không tạo iframe và có đường quay lại detail.
- Movie thiếu overview/releaseDate/duration/poster: có fallback, không xuất hiện `undefined` hoặc `NaN`.
- `/movie/99999`, `/movie/abc` và phim ẩn `/movie/32`: trạng thái Movie not found; 404 không retry. F5 trên detail/search/genre giữ nội dung.
- Search debounce: trước 300 ms chưa có suggestion; sau debounce có suggestion. ArrowDown + Enter chọn đúng phim; empty query, no-result, load-more (12 → 14 card), và Navbar search đều hoạt động.
- Genre: Action có 11 phim; chuyển sang Sci-Fi có 12 phim; invalid id hiển thị not-found.
- Real-mode với backend cố ý không reachable: Search hiển thị thông báo mạng thân thiện và nút Try Again; Genre hiển thị “Genres are coming soon”; không có unhandled rejection.
- Responsive: viewport 375, 768, 1440 px có `scrollWidth === clientWidth`; modal vừa màn hình 375 px; mobile menu hoạt động.
- Các test id xác nhận có mặt: `search-toggle`, `search-input`, `search-button`, `search-suggestion-{id}`, `movie-card-{id}`, `movie-title`, `watch-trailer-button`, `my-list-button`, `modal`, `trailer-modal`, Hero buttons và movie rows.
- Console sau lượt kiểm tra cuối: không có error/warning hay unhandled promise rejection.

Backend thực không reachable nên chưa xác minh dữ liệu thật ở Home/detail/404/search. Chưa kiểm thử thiết bị cảm ứng thật, Safari hoặc Firefox.

## 5. Quyết định và giới hạn

- Search và Genre dùng `paginate()` ở client; server data vẫn thuộc TanStack Query.
- Similar movies, genre chips và genre links chỉ hiển thị khi capability tương ứng bật (mock mode).
- `/watch/:id` dùng cùng route tree nhưng `MainLayout` bỏ Navbar/Footer theo pathname để không thay đổi route structure.
- Không thêm dependency.

## 6. Câu hỏi cho backend

- Backend có lọc `isVisible === false` trên list, search và detail hay detail sẽ trả 404?
- Khi nào có endpoint genres và similar movies; response shape dự kiến là gì?
- `genres`, `cast`, `rating` sẽ nằm trong movie detail hay endpoint riêng?
- Search có yêu cầu độ dài tối thiểu, chuẩn hóa dấu/ký tự, hoặc giới hạn kết quả không?
- `trailerKey` có luôn là YouTube key hay cần thêm trường provider?

## 7. Phase tiếp theo đề xuất

Tiếp theo nên triển khai Authentication UI và các flow người dùng (My List, History, Profile) theo contract, sau đó mới tới Admin để tránh trộn quyền truy cập và dữ liệu quản trị vào browse flow vừa hoàn thiện.
