# PRD – Website xem phim (UI clone Netflix)

> Phiên bản: 1.0 · Loại dự án: Đồ án · Tài liệu dùng chung cho Frontend và Backend

## 1. Tổng quan

**Tên dự án:** (đặt tên, ví dụ "Streamly")

**Mô tả ngắn:** Website xem phim có giao diện lấy cảm hứng từ Netflix. Người dùng duyệt phim theo hàng (carousel), xem chi tiết, xem trailer, tìm kiếm, đăng nhập để lưu danh sách yêu thích và lịch sử xem. Admin quản lý kho phim qua trang quản trị.

**Mục tiêu:**
- Hoàn thành một sản phẩm chạy được, demo được trong buổi bảo vệ đồ án.
- Giao diện giống Netflix về bố cục, màu sắc, hiệu ứng.
- Frontend và Backend tách riêng, giao tiếp qua REST API theo hợp đồng (xem tài liệu 04-API-Spec).

**Ngoài mục tiêu:** Không phát triển thành sản phẩm thương mại, không chịu tải lớn, không thanh toán.

## 2. Phân công & kiến trúc

| Vai trò | Phụ trách |
|---|---|
| Frontend | Darwin |
| Backend | Bạn đồng đội |

Hai bên **không cần dùng chung công nghệ**. Chỉ cần tuân thủ hợp đồng API (REST + JSON, xác thực bằng JWT). Mọi thay đổi API phải cập nhật vào tài liệu API Spec trước khi code.

```
[React SPA]  --HTTPS/JSON-->  [REST API Backend]  -->  [Database]
                                      |
                                      +--> [TMDB API] (đồng bộ dữ liệu phim)
```

## 3. Đối tượng người dùng (vai trò)

| Vai trò | Mô tả | Quyền |
|---|---|---|
| Khách (Guest) | Chưa đăng nhập | Xem trang chủ, chi tiết phim, tìm kiếm, xem trailer |
| User | Đã đăng ký | Quyền Guest + My List, lịch sử xem, đánh giá, quản lý hồ sơ |
| Admin | Quản trị viên | Quyền User + quản lý phim, thể loại, người dùng |

## 4. Tính năng

Mức ưu tiên: **P0** = bắt buộc (MVP), **P1** = nên có, **P2** = làm thêm nếu còn thời gian.

### 4.1 Xác thực & tài khoản
| ID | Tính năng | Ưu tiên |
|---|---|---|
| AUTH-01 | Đăng ký bằng email + mật khẩu | P0 |
| AUTH-02 | Đăng nhập / đăng xuất (JWT) | P0 |
| AUTH-03 | Duy trì phiên đăng nhập (refresh token hoặc token lưu an toàn) | P1 |
| AUTH-04 | Quên / đổi mật khẩu | P2 |
| AUTH-05 | Hồ sơ người dùng: tên hiển thị, avatar | P1 |

### 4.2 Duyệt & khám phá phim
| ID | Tính năng | Ưu tiên |
|---|---|---|
| BRW-01 | Trang chủ: hero banner phim nổi bật + các hàng phim (Thịnh hành, Mới thêm, theo thể loại) | P0 |
| BRW-02 | Carousel ngang cuộn mượt, hiệu ứng phóng to khi hover card | P0 |
| BRW-03 | Trang chi tiết phim: poster, mô tả, năm, thời lượng, thể loại, diễn viên, đánh giá, phim tương tự | P0 |
| BRW-04 | Lọc / duyệt theo thể loại | P1 |
| BRW-05 | Tìm kiếm theo tên phim (có gợi ý khi gõ) | P0 |
| BRW-06 | Phân trang hoặc cuộn vô hạn ở trang kết quả | P1 |

### 4.3 Xem phim
| ID | Tính năng | Ưu tiên |
|---|---|---|
| WCH-01 | Phát trailer YouTube (nhúng iframe, key lấy từ TMDB) | P0 |
| WCH-02 | Trang xem toàn màn hình với giao diện tối giản | P1 |
| WCH-03 | Ghi lại lịch sử xem khi User bấm xem | P0 |

> Lưu ý: dự án chỉ phát **trailer** từ YouTube, không lưu hay phát phim nguyên bản (tránh vấn đề bản quyền).

### 4.4 Tính năng cá nhân hoá
| ID | Tính năng | Ưu tiên |
|---|---|---|
| USR-01 | My List: thêm / xoá phim khỏi danh sách | P0 |
| USR-02 | Trang lịch sử xem | P1 |
| USR-03 | Đánh giá phim (thích / không thích hoặc 1–5 sao) | P2 |
| USR-04 | Nhiều hồ sơ (profile) trong một tài khoản như Netflix | P2 |

### 4.5 Trang quản trị (Admin)
| ID | Tính năng | Ưu tiên |
|---|---|---|
| ADM-01 | Đăng nhập admin, route được bảo vệ theo vai trò | P0 |
| ADM-02 | Danh sách phim: tìm kiếm, lọc, phân trang | P0 |
| ADM-03 | Thêm phim bằng cách tìm và nhập từ TMDB (theo tên hoặc TMDB ID) | P0 |
| ADM-04 | Sửa thông tin phim (tiêu đề, mô tả, poster, trailer key, thể loại) | P0 |
| ADM-05 | Ẩn / hiện / xoá phim | P0 |
| ADM-06 | Đánh dấu phim nổi bật cho hero banner | P1 |
| ADM-07 | Quản lý thể loại | P1 |
| ADM-08 | Quản lý người dùng (xem danh sách, khoá tài khoản) | P1 |
| ADM-09 | Dashboard thống kê (số phim, số user, phim được xem nhiều) | P2 |

## 5. Danh sách trang (Frontend)

| Trang | Đường dẫn | Quyền truy cập |
|---|---|---|
| Đăng nhập / Đăng ký | `/login`, `/register` | Guest |
| Trang chủ (Browse) | `/` | Mọi người |
| Chi tiết phim | `/movie/:id` | Mọi người |
| Tìm kiếm | `/search?q=` | Mọi người |
| Theo thể loại | `/genre/:id` | Mọi người |
| Xem phim | `/watch/:id` | Mọi người (ghi lịch sử nếu đã đăng nhập) |
| My List | `/my-list` | User |
| Lịch sử xem | `/history` | User |
| Hồ sơ | `/profile` | User |
| Admin – phim | `/admin/movies` | Admin |
| Admin – thêm / sửa phim | `/admin/movies/new`, `/admin/movies/:id` | Admin |
| Admin – thể loại, người dùng, dashboard | `/admin/genres`, `/admin/users`, `/admin` | Admin |
| 404 | `*` | Mọi người |

## 6. Nguồn dữ liệu phim

- **Nguồn:** TMDB API (The Movie Database) cho metadata, poster, backdrop, diễn viên và trailer.
- **Cách dùng đề xuất:** Backend gọi TMDB (giữ API key ở server), lưu dữ liệu vào database của mình. Frontend **chỉ gọi API của backend**, không gọi trực tiếp TMDB.
- **Trailer:** TMDB trả về `key` của video YouTube; frontend nhúng bằng `https://www.youtube.com/embed/{key}`.
- **Điều khoản:** TMDB yêu cầu hiển thị ghi nguồn ("This product uses the TMDB API but is not endorsed or certified by TMDB") — đặt ở footer.

## 7. Yêu cầu phi chức năng

- **Responsive:** hiển thị tốt trên desktop, tablet, mobile.
- **Hiệu năng:** trang chủ tải dưới ~3 giây trên mạng thường; ảnh lazy-load.
- **Bảo mật:** mật khẩu băm (bcrypt/argon2); JWT; kiểm tra quyền admin ở **backend**, không chỉ ở frontend; cấu hình CORS đúng.
- **Trạng thái UI:** có loading skeleton, trạng thái rỗng, thông báo lỗi.
- **Trình duyệt:** Chrome, Edge, Firefox, Safari bản mới.
- **Ngôn ngữ giao diện:** (chọn: Tiếng Anh hoặc Tiếng Việt, hoặc cả hai).

## 8. Công nghệ đề xuất

| Lớp | Đề xuất | Lý do |
|---|---|---|
| Frontend | React + Vite + TypeScript, Tailwind CSS, React Router, TanStack Query | Nhanh, phổ biến, AI vibecode tốt; tách biệt hoàn toàn khỏi backend |
| Backend | ASP.NET Core 8 Web API + EF Core + PostgreSQL | Dễ làm REST + JWT + phân quyền, dữ liệu phim có quan hệ rõ ràng |
| Hợp đồng API | REST + JSON, tài liệu OpenAPI/Swagger | Hai người làm độc lập, có thể mock dữ liệu khi chờ nhau |
| Deploy | FE: Vercel/Netlify · BE: Render/Railway · DB: Neon/Supabase | Miễn phí hoặc rẻ, đủ cho đồ án |

Chi tiết nằm ở `02-Tech-Stack-Architecture.md`. Backend có thể điều chỉnh công nghệ nếu người làm backend cần, miễn là giữ đúng hợp đồng API.

## 9. Tiêu chí hoàn thành (Definition of Done)

- Toàn bộ tính năng P0 chạy được end-to-end trên môi trường deploy.
- Admin thêm được một phim từ TMDB và phim xuất hiện trên trang chủ.
- User đăng ký, đăng nhập, thêm phim vào My List, xem trailer và thấy lịch sử xem.
- Giao diện responsive, không lỗi console nghiêm trọng.
- Có tài liệu hướng dẫn chạy dự án (README) cho cả FE và BE.

## 10. Rủi ro & câu hỏi mở

| # | Nội dung | Người quyết định |
|---|---|---|
| 1 | Backend xác nhận dùng ASP.NET Core + PostgreSQL? | Bạn làm backend |
| 2 | Có nhiều profile trong một tài khoản không (P2)? | Darwin + bạn làm backend |
| 3 | Ngôn ngữ giao diện? | Darwin |
| 4 | Thời hạn nộp và các mốc kiểm tra giữa kỳ? | Cả hai |
| 5 | Một số phim TMDB không có trailer: hiển thị gì? (đề xuất: ẩn nút xem, hiện thông báo) | Cả hai |

## 11. Các tài liệu tiếp theo

1. Tech Stack & Architecture
2. Database Schema
3. API Spec (quan trọng nhất cho việc phối hợp FE–BE)
4. UI/UX Spec & Design System
5. Sitemap & Component List
6. Coding Conventions & Folder Structure
7. AI Rules File (`CLAUDE.md`)
8. Roadmap & Task Breakdown
