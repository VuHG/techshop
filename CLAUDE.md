# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TechShop** — e-commerce website for tech products (laptops, PCs, components, accessories) with an AI chatbot advisor. This is a university graduation project (IT Year 4). Full spec in [TECHSHOP_PROJECT_BRIEF.md](TECHSHOP_PROJECT_BRIEF.md).

**MVP scope:** Guest + Customer features only. Admin panel is deferred.

**Production constraint:** VPS with 2GB RAM, 3 CPU cores. Every technical decision must account for this. No over-engineering.

---

## Architecture

**Pattern: Modular Monolith** — single Spring Boot JAR organized by module (not true microservices; RAM-constrained).

```
Nginx (reverse proxy, SSL, rate limiting)
  ├── Next.js frontend        :3000
  ├── Spring Boot backend     :8080
  └── Node.js AI gateway      :3001
          ↓              ↓
      PostgreSQL 16    Redis 7    →  Groq API
```

### Backend module structure (`com.techshop/`)

```
module/
  auth/        — registration, login, OTP, JWT
  product/     — products, variants, categories, filters
  cart/        — cart management
  order/       — checkout, order timeline
  discount/    — voucher codes
  review/      — product ratings
  notification/— user notifications
  profile/     — personal info + addresses
shared/
  security/    — JWT filter, SecurityConfig
  exception/   — ErrorCode enum, GlobalExceptionHandler
  response/    — ApiResponse<T> wrapper
  config/      — Redis, Mail, Async beans
  util/        — helpers
```

**Module boundary rules:**
- Modules never import each other's `@Entity` classes. Communicate via interfaces + DTOs only.
- Controllers only call Services in the same module.
- Cross-module calls go through a Service interface (e.g., `OrderService` → `ProductQueryService`).
- Always map Entity → DTO before returning from a Service.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.3.x, Java 21, Maven |
| ORM / Migration | Spring Data JPA + Hibernate, Flyway |
| Security | Spring Security + JWT (jjwt 0.11.5) |
| Cache | Spring Data Redis 7 |
| Email | Spring Mail + SendGrid SMTP |
| Utilities | Lombok, MapStruct, Jakarta Validation |
| Database | PostgreSQL 16 (heavy JSONB usage) |
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS |
| State | Zustand + TanStack Query v5 |
| Forms | React Hook Form + Zod |
| HTTP client | Axios |
| AI Gateway | Node.js 20, Express.js, Groq SDK (`llama-3.1-70b-versatile`) |
| DevOps | Docker Compose, Nginx, Let's Encrypt, GitHub Actions, Sentry |

---

## Common Commands

Once the project is initialized:

**Backend (Spring Boot):**
```bash
mvn clean install          # Build
mvn spring-boot:run        # Run dev server (port 8080)
mvn test                   # Run all tests
mvn test -Dtest=ClassName  # Run single test class
```

**Frontend (Next.js):**
```bash
npm install
npm run dev    # Dev server (port 3000)
npm run build  # Production build
npm run lint   # ESLint
```

**AI Gateway (Node.js):**
```bash
npm install
npm run dev    # Dev server (port 3001)
```

**Docker Compose (full stack):**
```bash
docker-compose up -d          # Start all services
docker-compose logs -f        # Follow logs
docker-compose down           # Stop all
```

---

## Design Philosophy

**1. Snapshot pattern is mandatory for orders.** `don_hang` and `chi_tiet_don_hang` store `gia_luc_mua`, `ten_san_pham`, `thong_so_bien_the`, `duong_dan_anh_chinh` at purchase time. Never JOIN back to product tables to reconstruct order history.

**2. Cached fields are not computed on read.** `san_pham.diem_danh_gia_tb`, `so_luot_danh_gia`, `so_luot_ban`, and `bien_the_san_pham.so_luong_ton` are cache columns — update them on write events, never with `AVG()` or `COUNT()` at query time.

**3. JSONB for flexible schemas.** Three key JSONB columns:
- `san_pham.thong_so_ky_thuat` — shared specs across variants
- `bien_the_san_pham.thong_so_bien_the` — per-variant attributes: `{"ram":"16GB","color":"Đen"}`
- `chi_tiet_thuoc_tinh_loc.thong_so_loc` — pre-computed filter schema per product type

Always add GIN indexes on JSONB columns that are queried.

**4. Atomic SQL for concurrency (no distributed locks).**
```sql
-- Voucher decrement
UPDATE ma_giam_gia SET so_luong_da_dung = so_luong_da_dung + 1
WHERE id = ? AND so_luong_da_dung < so_luong_toi_da

-- Stock decrement
UPDATE bien_the_san_pham SET so_luong_ton = so_luong_ton - ?
WHERE id = ? AND so_luong_ton >= ?
```

**5. Async for side effects.** Email and notification sends must use `@Async`. Failures should be logged, never thrown.

**6. Business logic belongs in Java.** No complex DB-side computation (totals, discount application, shipping calc). DB does two things: store and retrieve fast. Avoid multi-table JOINs and full-table scans.

---

## Database: 26 Tables

All table and column names use **Vietnamese without diacritics, snake_case**. Comments, UI text, and logs use **Vietnamese with diacritics**.

| Group | Tables |
|---|---|
| Auth & Users | `vai_tro`, `nguoi_dung`, `mat_khau_reset`, `dia_chi` |
| Catalog | `danh_muc`, `phan_loai_san_pham`, `chi_tiet_thuoc_tinh_loc` |
| Attributes | `thuoc_tinh`, `gia_tri_thuoc_tinh` |
| Tags | `nhan_san_pham` |
| Products | `san_pham`, `bien_the_san_pham`, `bien_the_gia_tri_thuoc_tinh`, `bien_the_nhan`, `anh_san_pham` |
| Cart | `gio_hang` |
| Orders | `don_hang`, `chi_tiet_don_hang`, `lich_su_trang_thai_don_hang` |
| Reviews | `danh_gia`, `danh_gia_media` |
| Notifications | `thong_bao` |
| Discounts | `ma_giam_gia`, `ma_giam_gia_san_pham`, `lich_su_dung_ma` |
| Stock | `phieu_nhap`, `chi_tiet_phieu_nhap` |

**Schema rules:** All PKs are `BIGSERIAL`. Timestamps: `ngay_tao`, `ngay_cap_nhat` with `default now()`. Soft delete via `trang_thai` enum (VARCHAR with constraint, not PostgreSQL ENUM type). Prices stored as `DECIMAL(15,2)`, never FLOAT. Timestamps as `TIMESTAMP WITH TIME ZONE`.

---

## API Standards

- Base URL: `http://localhost:8080/api` (local), `https://techshop.vn/api` (prod)
- Auth: `Authorization: Bearer <token>` header. Access token: 15min. Refresh token: 7 days.
- All endpoints except `/api/auth/*` require JWT.
- Pagination: `?page=0&size=20` → response includes `items`, `totalElements`, `totalPages`, `currentPage`, `hasNext`.

**Response envelope:**
```json
// Success
{ "success": true, "data": {...}, "timestamp": "..." }

// Error
{ "success": false, "errorCode": "PROD_001", "message": "Sản phẩm không tồn tại", "timestamp": "..." }
```

Error codes: `AUTH_001–006`, `PROD_001–003`, `CART_001–002`, `ORD_001–003`, `DIS_001–004`, `REV_001–002`. See TECHSHOP_PROJECT_BRIEF.md §8 for full list.

---

## Code Standards

**Java:** PascalCase classes (`NguoiDung`, `ProductService`), camelCase methods, UPPER_SNAKE_CASE constants. Use `@Data @Builder` on DTOs, `@RequiredArgsConstructor` on Services/Controllers, `@Slf4j` for logging. `@Transactional` at Service layer, never Controller. Validate all DTOs with `@Valid` at Controller layer. Validation messages in Vietnamese.

**TypeScript:** PascalCase for component files and names (`ProductCard.tsx`), kebab-case for page routes. No `any` types. Inline styles are forbidden — use Tailwind classes only. API URL must come from `process.env.NEXT_PUBLIC_API_URL`, never hardcoded.

---

## Locked Decisions (Do Not Change)

| Decision | Choice |
|---|---|
| Login method | Phone number + password |
| OTP delivery | 6-digit code via **Email** (not SMS), expires 5 min |
| Payment (MVP) | COD only |
| Voucher (MVP) | 1 code per order |
| Social login | Excluded from MVP |
| AI chat history | Session-only, not persisted to DB |
| Review media | Text-only for MVP |
| Order status tabs | 6 tabs: Tất cả / Chờ xử lý / Đang giao / Giao thành công / Hoàn thành / Đã hủy |

**Order status flow:** `CHO_XU_LY → DANG_GIAO → GIAO_THANH_CONG → HOAN_THANH` (cancel only from `CHO_XU_LY`). COD skips `CHO_THANH_TOAN`.

---

## Common Pitfalls

**Backend — never do:**
- `spring.jpa.hibernate.ddl-auto: create/update` (use Flyway migrations only)
- JOIN product tables at order-read time (snapshot exists for a reason)
- `AVG()` for product ratings (use cached `diem_danh_gia_tb`)
- Return `@Entity` objects directly from controllers
- Catch generic `Exception` (use `AppException` + `ErrorCode`)
- Log passwords, tokens, or sensitive data
- Miss `@Async` on email/notification sends

**Frontend — never do:**
- Fetch data without a loading state
- Use `any` type
- Store access token in Context without Zustand `persist`
- Skip `ProtectedRoute` on `/account` and `/checkout` pages

**Database — never do:**
- Use `SERIAL` instead of `BIGSERIAL`
- Store prices as `FLOAT`
- Add JSONB columns without GIN indexes (when those columns are queried)
- Omit foreign key constraints
