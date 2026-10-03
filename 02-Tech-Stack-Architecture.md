# Tech Stack & Architecture

> Phiên bản: 1.0 · Phụ thuộc: `01-PRD.md` · Dùng chung cho Frontend (React) và Backend (.NET)

## 1. Quyết định công nghệ

| Lớp | Công nghệ | Ghi chú |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | SPA chạy độc lập với backend |
| Styling | Tailwind CSS | Dễ dựng giao diện kiểu Netflix nhanh |
| Backend | ASP.NET Core 8 Web API (C#) | REST + JSON |
| ORM | Entity Framework Core | Migration code-first |
| Database | PostgreSQL (hoặc SQL Server) | Bạn làm backend chọn; tài liệu Database Schema không phụ thuộc loại DB |
| Xác thực | JWT Bearer | Hash mật khẩu bằng BCrypt hoặc ASP.NET Identity |
| Nguồn dữ liệu phim | TMDB API | Gọi từ backend, không gọi từ frontend |
| API docs | Swagger / OpenAPI | Là "hợp đồng" giữa FE và BE |

> TypeScript là JavaScript có thêm kiểu dữ liệu. Chọn TypeScript vì giúp AI và bạn bắt lỗi sớm khi vibecode; nếu muốn JS thuần vẫn đổi được mà không ảnh hưởng kiến trúc.

## 2. Kiến trúc tổng thể

```
┌────────────────────┐   HTTPS / JSON    ┌──────────────────────────┐
│  Frontend (React)  │ ───────────────►  │  Backend (ASP.NET Core)  │
│  Vite SPA          │ ◄───────────────  │  /api/v1/...             │
│  (Vercel/Netlify)  │      JWT          │  (Azure/Render/Railway)  │
└────────────────────┘                   └───────┬───────────┬──────┘
                                                 │           │
                                          ┌──────▼─────┐ ┌───▼───────────┐
                                          │ PostgreSQL │ │   TMDB API    │
                                          └────────────┘ └───────────────┘
```

Nguyên tắc:
- Frontend **chỉ nói chuyện với backend**. API key TMDB nằm ở server.
- Backend là nơi **duy nhất** kiểm tra quyền (User/Admin). Frontend ẩn menu admin chỉ để tiện UX, không phải bảo mật.
- Trailer: backend trả `trailerKey` (YouTube), frontend nhúng iframe `https://www.youtube.com/embed/{trailerKey}`.

## 3. Frontend

### 3.1 Thư viện chính

| Mục đích | Thư viện |
|---|---|
| Routing | React Router v6 |
| Gọi API + cache dữ liệu | TanStack Query + Axios |
| Trạng thái toàn cục (auth) | Zustand |
| Form + validate | React Hook Form + Zod |
| Carousel ngang | Embla Carousel (hoặc Swiper) |
| Icon | lucide-react |
| Animation (tuỳ chọn) | Framer Motion |
| Bảng dữ liệu admin | TanStack Table |
| Thông báo | react-hot-toast |

Giữ danh sách này gọn: không thêm thư viện mới nếu chưa cần.

### 3.2 Cấu trúc thư mục (đề xuất)

```
frontend/
├─ src/
│  ├─ api/            # axios instance, các hàm gọi API theo module
│  ├─ components/     # component dùng chung (Navbar, MovieCard, Row, Modal...)
│  ├─ features/       # theo tính năng: auth, movies, my-list, admin...
│  ├─ hooks/
│  ├─ pages/          # mỗi route một trang
│  ├─ routes/         # cấu hình router, ProtectedRoute, AdminRoute
│  ├─ store/          # zustand stores
│  ├─ types/          # kiểu dữ liệu khớp với API
│  └─ lib/            # tiện ích, hằng số
├─ .env.example
└─ vite.config.ts
```

(Chi tiết sẽ nằm trong tài liệu *Coding Conventions & Folder Structure*.)

## 4. Backend (.NET)

### 4.1 Thành phần chính

| Mục đích | Công nghệ |
|---|---|
| Web API | ASP.NET Core 8 (Controllers hoặc Minimal API) |
| ORM | EF Core + Npgsql (PostgreSQL) hoặc SqlServer provider |
| Xác thực | `Microsoft.AspNetCore.Authentication.JwtBearer` |
| Phân quyền | Role-based: `User`, `Admin` (`[Authorize(Roles = "Admin")]`) |
| Validate | FluentValidation hoặc DataAnnotations |
| Gọi TMDB | `HttpClient` (typed client) |
| Tài liệu API | Swashbuckle (Swagger UI) |
| Log | Serilog (tuỳ chọn) |

### 4.2 Phân lớp gợi ý

```
backend/
├─ Controllers/      # nhận request, trả response
├─ Services/         # logic nghiệp vụ (MovieService, AuthService, TmdbService)
├─ Data/             # DbContext, migrations, entity
├─ Dtos/             # request/response models
├─ Middleware/       # xử lý lỗi toàn cục
└─ Program.cs
```

Bạn làm backend có thể điều chỉnh cấu trúc, miễn là giữ đúng hợp đồng API.

## 5. Quy ước giao tiếp FE ↔ BE

| Mục | Quy ước |
|---|---|
| Base URL | `{API_URL}/api/v1` |
| Định dạng | JSON, tên trường `camelCase` |
| Ngày giờ | ISO 8601, UTC (`2026-10-02T08:00:00Z`) |
| ID | số nguyên hoặc GUID — chốt trong tài liệu Database Schema |
| Xác thực | Header `Authorization: Bearer <accessToken>` |
| Phân trang | Query `?page=1&pageSize=20`; response gồm `items`, `page`, `pageSize`, `totalItems`, `totalPages` |
| Lỗi | Dạng chuẩn `ProblemDetails` của ASP.NET: `{ "title", "status", "detail", "errors": { "field": ["msg"] } }` |
| Mã trạng thái | 200/201 thành công · 400 dữ liệu sai · 401 chưa đăng nhập · 403 không đủ quyền · 404 không tìm thấy · 409 trùng dữ liệu |
| CORS | Backend cho phép origin của frontend (local + domain deploy) |

## 6. Xác thực & phân quyền

**Luồng đăng nhập:**
1. FE gửi email + mật khẩu tới `POST /auth/login`.
2. BE trả `accessToken` (JWT, hạn 60 phút) và thông tin user (gồm `role`).
3. FE lưu token, gắn vào header cho mọi request cần đăng nhập.
4. Gặp 401 → FE xoá token và chuyển về `/login`.

**Lưu token (quyết định cho đồ án):** lưu `accessToken` trong `localStorage` để đơn giản. Đây là cách phổ biến cho đồ án nhưng có rủi ro XSS; nếu còn thời gian (P1), nâng cấp lên refresh token lưu trong cookie `httpOnly`.

**Phân quyền:** JWT chứa claim `role`. FE dùng `AdminRoute` để chặn trang admin; BE dùng `[Authorize(Roles = "Admin")]` để chặn thật sự.

## 7. Luồng dữ liệu phim (TMDB)

1. Admin tìm phim trong trang admin → FE gọi `GET /admin/tmdb/search?q=...`.
2. BE gọi TMDB, trả danh sách rút gọn.
3. Admin chọn phim → FE gọi `POST /admin/movies/import` với `tmdbId`.
4. BE lấy chi tiết + diễn viên + video trailer từ TMDB, lưu vào DB.
5. Người dùng chỉ đọc dữ liệu từ DB của mình (nhanh, không phụ thuộc TMDB lúc chạy).

Ghi chú: ảnh poster/backdrop có thể dùng trực tiếp URL của TMDB image CDN (`https://image.tmdb.org/t/p/{size}{path}`); backend lưu `posterPath`, `backdropPath`, frontend tự ghép URL.

## 8. Môi trường & cấu hình

| Môi trường | Frontend | Backend |
|---|---|---|
| Local | `http://localhost:5173` | `http://localhost:5000` (hoặc cổng .NET mặc định) |
| Production | Vercel / Netlify | Azure App Service / Render (Docker) / Railway |
| Database | Local PostgreSQL | Neon / Supabase (PostgreSQL) hoặc Azure SQL |

**Biến môi trường:**
- Frontend: `VITE_API_URL`
- Backend: `ConnectionStrings__Default`, `Jwt__Key`, `Jwt__Issuer`, `Tmdb__ApiKey`, `Cors__AllowedOrigins`

Không commit file `.env` hay secret lên Git; chỉ commit `.env.example`.

## 9. Quy trình làm việc song song FE–BE

1. **Contract-first:** thống nhất `04-API-Spec` trước khi code endpoint.
2. **Swagger là nguồn sự thật:** backend publish Swagger; frontend đối chiếu kiểu dữ liệu.
3. **Mock khi chờ nhau:** frontend dùng dữ liệu giả (MSW hoặc file JSON) với đúng cấu trúc response đã thống nhất, nên không phải đợi backend xong.
4. **Git:** một repo monorepo (`/frontend`, `/backend`) hoặc hai repo riêng. Nhánh `main` luôn chạy được, mỗi tính năng một nhánh `feature/...`, merge qua Pull Request.
5. **Đổi API:** báo cho bên kia và cập nhật API Spec trước khi merge.

## 10. Việc cần xác nhận với bạn làm backend

| # | Câu hỏi | Đề xuất mặc định |
|---|---|---|
| 1 | Database dùng loại nào? | PostgreSQL |
| 2 | ID dạng số hay GUID? | Số nguyên tự tăng (đơn giản) |
| 3 | Dùng ASP.NET Identity hay tự viết auth? | Tự viết (đơn giản hơn cho đồ án) |
| 4 | Deploy backend ở đâu? | Render (Docker) hoặc Azure |
| 5 | Monorepo hay hai repo? | Monorepo |

## 11. Tài liệu tiếp theo

- `03-Database-Schema.md`
- `04-API-Spec.md`
