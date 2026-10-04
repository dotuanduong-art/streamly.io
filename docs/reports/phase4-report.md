# Phase 4 — Watch History & Profile

Ngôn ngữ UI: English. Đã đọc `AGENTS.md`, `01-PRD.md`, `02-Tech-Stack-Architecture.md`, `03-FE-BE-Contract.md`, báo cáo Phase 3 và `docs/proposed-api.md` trước khi sửa mã. `vite.config.ts` đã khóa `localhost:5173` bằng `strictPort: true` từ Phase 3.

## Tệp thay đổi

- Mới: `src/types/history.ts`, `src/types/profile.ts`, `src/api/history.api.ts`, `src/api/profile.api.ts`, `src/features/history/hooks/index.ts`, `src/features/history/hooks/useWatchRecording.ts`, `src/features/profile/hooks/index.ts`, `src/features/profile/schemas.ts`, `src/features/profile/components/ProfileForm.tsx`, `src/components/modal/ConfirmDialog.tsx`, `src/components/ui/Avatar.tsx`, `src/lib/time.ts`.
- Sửa: `src/types/index.ts`, `src/lib/queryKeys.ts`, `src/features/auth/mockAuth.ts`, `src/components/layout/Navbar.tsx`, `src/components/modal/Modal.tsx`, `src/components/movie/MovieGrid.tsx`, `src/features/movies/components/MovieDetail.tsx`, `src/pages/WatchPage.tsx`, `src/pages/HistoryPage.tsx`, `src/pages/ProfilePage.tsx`, `docs/proposed-api.md`, `docs/testids.md`.

## Kiến trúc và giao diện component

Phase 3 đặt My List ở `api/myList.api.ts` (mock/localStorage theo user ID), `features/my-list/hooks` (TanStack Query, optimistic update/rollback), `queryKeys.myList(userId)` và xóa cache khi sign out. History dùng cùng cấu trúc, khóa `queryKeys.history(userId)`. Profile override nằm trong mock API, còn user phiên được cập nhật bằng action `updateUser` sẵn có của auth store, vốn lưu cả localStorage. Sign out xóa cache My List, History và Profile. Khi `VITE_USE_MOCK_AUTH=false`, History/Profile hiển thị trạng thái chưa khả dụng và không gọi endpoint chưa tồn tại; movie API vẫn dùng cờ độc lập `VITE_USE_MOCK`.

`HistoryItem = { movie: Movie; watchedAt: string }` (ISO 8601 UTC); `UpdateProfileRequest = { displayName: string; avatarUrl?: string | null }`. Tái dùng `User` hiện có. Mock History upsert một bản ghi mỗi phim và sắp mới nhất trước. Nó lọc ID phim mất/ẩn qua nguồn movie đang hoạt động. Ghi ở `/watch/:id` sau khi phim có trailer, và khi mở modal trailer ở trang chi tiết; chỉ với tài khoản đã đăng nhập. Ref trong hook chặn effect lặp của StrictMode và re-render, đặt lại khi modal đóng. Mutation bị lỗi được bắt im lặng; phát trailer không phụ thuộc kết quả ghi.

- `ConfirmDialog`: `isOpen`, `onClose`, `onConfirm`, `title`, `message`, `confirmLabel?`, `cancelLabel?`, `destructive?`, `isLoading?`. Dùng Modal, khóa đóng bằng Esc/backdrop và cả hai nút khi loading.
- `Avatar`: `name`, `avatarUrl?`, `className?`; ảnh lỗi chuyển sang chữ cái đầu.
- `ProfileForm`: `user: User`; React Hook Form + Zod, 8 avatar preset và tùy chọn initials.
- `HistoryPage` không nhận props; danh sách phẳng mới nhất trước, dùng `MovieGrid`, 12 mục mỗi lần qua `paginate()`.

`docs/proposed-api.md` bổ sung GET/POST/DELETE History và PUT Profile, các status 400/401/403/404, body `{ message }` / `{ message, errors }`, Bearer token và avatar URL thuần. Tất cả vẫn là **PROPOSED — NOT AGREED WITH BACKEND**.

## Kiểm tra

- `npm run dev`: chạy trên `http://localhost:5173/`; `npx tsc --noEmit`: pass; `npm run build`: pass. Cảnh báo chunk 599.35 kB đã biết, giữ nguyên theo phạm vi task. `git diff --check`: không có lỗi whitespace (Git chỉ cảnh báo chuyển LF/CRLF).
- Browser mock: `/watch/2` ghi 1 mục; mở modal phim đó cập nhật `watchedAt`, vẫn 1 mục. Instrument tạm thời trong mock API xác nhận mỗi lần vào Watch/mở Modal chỉ gọi ghi **1 lần** dưới React StrictMode; đóng rồi mở lại gọi lần mới. Đã xóa instrument. Esc đóng modal, DOM gỡ modal và focus trở lại nút mở. `/watch/1` không có trailer và không ghi lịch sử.
- Guest xem trailer không toast/lỗi; `/history` và `/profile` chuyển đến `/login`, sau đăng nhập trở lại `/history`. User/Admin có lịch sử riêng; User giữ tên/avatar sau F5 và sau đăng xuất/đăng nhập lại. Xóa một mục cập nhật UI ngay. Clear dialog: Cancel, Esc, Confirm và trạng thái nút bị khóa lúc chờ; rỗng và F5 đều đúng.
- Mô phỏng lỗi tạm thời rồi hoàn nguyên: ghi thất bại vẫn có iframe, không toast hay lỗi console; remove thất bại khôi phục mục; tải lịch sử thất bại hiện message và nhấn Retry tải lại thành công; profile API trả `errors.displayName` hiện cả lỗi trường và form.
- Profile: nút Save vô hiệu khi chưa sửa/invalid, kiểm tra độ dài, lưu tên và avatar cập nhật Navbar ngay, vẫn còn sau F5/sign in; native radio đổi lựa chọn bằng phím mũi tên. Modal hoạt động ở 375 px. History và Profile không tràn ngang tại 375/768/1440 px. Không thấy error/warning/unhandled rejection trong browser log sau kiểm tra.

Chưa xác minh: backend thật (`http://localhost:5000/api/movies` timeout, nên không chạy real-movies mode), trình duyệt Safari/Firefox, thiết bị cảm ứng, tình huống lịch sử >12 mục qua UI, và trường hợp ảnh avatar hỏng qua thao tác UI. Trang dùng ảnh fallback `onError` theo mã.

## Ghi chú cho phase kế tiếp

Backend cần thống nhất History/Profile proposal, đặc biệt ngữ nghĩa upsert, trả `watchedAt` UTC, xử lý phim bị ẩn, và giới hạn avatar URL. Phase tiếp theo có thể làm Admin theo PRD; không thay đổi route hay contract Movie trong Phase 4.
