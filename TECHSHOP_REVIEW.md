# TECHSHOP — REVIEW NHỮNG NHIỆM VỤ ĐÃ LÀM

> **Dự án:** TechShop — Website bán đồ công nghệ + chatbot AI tư vấn (đồ án tốt nghiệp IT năm 4)
> **Cập nhật:** 2026-05-31 · **Nhánh:** `develop` · **Commit mới nhất:** `e3a77e5`
> **Trạng thái tổng quát:** Phase 0 → 10 **xong**. **Phase 11 đang tiến hành** (đã làm rất nhiều: schema align, flash sale backend, card theo biến thể, lọc nâng cao, rút gọn catalog...). Còn lại: hoàn tất Phase 11 (E2E + performance + security + polish tiếp) → Phase 12 Deploy → Phase 13 Monitoring.

---

## 1. Bức tranh tổng thể

TechShop là một **Modular Monolith** gồm 3 tiến trình chạy song song:

```
Nginx (sẽ dựng ở Phase 12)
  ├── Next.js frontend      :3000   → ~19 trang, 10 service, 5 store
  ├── Spring Boot backend   :8080   → 9 module, ~11 controller, ~44 endpoint
  └── Node.js AI gateway    :3001   → Express + Google Gemini
          ↓            ↓
     PostgreSQL 16   Redis 7
```

**Mô hình làm việc 2 máy:** code sửa trên **Windows** (nơi Claude chạy) → push `develop` → **Ubuntu Server (VMware)** pull + chạy (`mvn spring-boot:run`, Docker postgres+redis, npm dev). Browser test từ Windows qua IP Ubuntu.

**DB hiện tại:** **28 bảng nghiệp vụ** (migrations V1–V10) — xem mục 3.1. (Trong psql `\dt` sẽ thấy 29 vì có thêm `flyway_schema_history` của Flyway.)

---

## 2. Tiến độ theo Phase

| Phase | Nội dung | Trạng thái | Commit chính |
|---|---|---|---|
| 0 | Setup môi trường (Docker, PostgreSQL 16, Redis 7, Git, SSH) | ✅ Xong + test | `65ffb88`, `2d58600` |
| 1 | DB: Flyway V1–V6 → 27 bảng + seed | ✅ Xong + test | `bacd5f7`, `d30ec32` |
| 2 | Auth module (8 ep, JWT, OTP) | ✅ Xong + test | `88936bf` |
| 3 | Product + Category (filter JSONB, so sánh, gợi ý, Redis cache) | ✅ Xong + test | `88f9e1d` |
| 4 | Cart + Order + Discount (snapshot, atomic SQL) | ✅ Xong + test | `0ba25cd` |
| 5 | Profile/Address + Review + Notification | ✅ Xong + test | `918cd90` |
| 6 | AI Gateway (Node + Gemini) | ✅ Xong + test | `9722acd` |
| 7 | Frontend setup + layout | ✅ Xong + test | `7234e05` |
| 8 | FE Auth + Product browsing | ✅ Xong + test | `ac8e4e5`→`547c613` |
| 9 | FE Cart + Checkout + Order + Account | ✅ Code xong (đã test khi làm Phase 11) | `0b2bfeb`→`9c2aef6` |
| 10 | FE Review + Notification + Chatbot | ✅ Code xong | `1b332ac` |
| **11** | **Testing & Polish** (schema align, flash sale BE, card biến thể, lọc nâng cao, rút gọn catalog, fix lỗi, polish UI) | 🔄 **Đang làm** — xem mục 3.5 | `d71e1fa`→`e3a77e5` |

---

## 3. Backend — chi tiết đã làm

### 3.1. Cơ sở dữ liệu — **28 bảng** (Flyway V1–V10)

| Nhóm | Migration | Bảng |
|---|---|---|
| Auth & Users (4) | V1 | vai_tro, nguoi_dung, mat_khau_reset, dia_chi |
| Catalog/Thuộc tính/Nhãn (6) | V2 | danh_muc, phan_loai_san_pham, chi_tiet_thuoc_tinh_loc, thuoc_tinh, gia_tri_thuoc_tinh, nhan_san_pham |
| Sản phẩm (5) | V3 | san_pham, bien_the_san_pham, bien_the_gia_tri_thuoc_tinh, bien_the_nhan, anh_san_pham |
| Giao dịch/Kho (12) | V4 | gio_hang, ma_giam_gia, don_hang, chi_tiet_don_hang, lich_su_trang_thai_don_hang, danh_gia, danh_gia_media, thong_bao, ma_giam_gia_san_pham, lich_su_dung_ma, phieu_nhap, chi_tiet_phieu_nhap |
| **Flash sale (1)** | **V8** | **flashsale** ⬅ Phase 11 |

- **Seed/đổi dữ liệu:** V5 (seed gốc), V6 (150 SP), V9 (tag "Nổi bật"), **V10 (XÓA 7 danh mục linh kiện/phụ kiện + ~105 SP)**.
- **Sửa schema:** **V7** `ALTER TABLE ADD COLUMN` ~18 bảng (đồng bộ thiết kế gốc, đều nullable/default + FK + UNIQUE + backfill; không rename/không xóa). Entity Java **chưa map** cột mới (dùng khi làm Admin).
- PK `BIGSERIAL`, giá `DECIMAL(15,2)`, timestamp `TIMESTAMPTZ`, soft-delete qua `trang_thai`. JSONB + GIN: `thong_so_ky_thuat`, `thong_so_bien_the`, `thong_so_loc`.

### 3.2. Module + endpoint (9 module / ~11 controller / ~44 endpoint)
| Module | Controller | Vai trò |
|---|---|---|
| auth | `AuthController` | Đăng ký, đăng nhập (SĐT+MK), OTP email, refresh/logout |
| product | `SanPhamController`, `DanhMucController`, **`TieuChiSyncController`** | Danh sách **theo biến thể** + lọc (JSONB/khuyến mãi/tag/giá) + sort, chi tiết, gợi ý, so sánh, filter-schema, **đồng bộ tiêu chí** |
| **flashsale** | **`FlashSaleController`** | `GET /api/flash-sale` (đang diễn ra) |
| cart | `GioHangController` | Thêm/sửa/xóa/xem giỏ (giá đã tính cả flash sale) |
| discount | `MaGiamGiaController` | Áp mã giảm (1 mã/đơn) |
| order | `DonHangController` | Đặt COD, lịch sử, chi tiết, hủy, xác nhận |
| profile | `ProfileController` | Profile + CRUD địa chỉ |
| review | `DanhGiaController` | Đánh giá (đơn HOAN_THANH) |
| notification | `ThongBaoController` | Danh sách, đếm, đánh dấu đã đọc |

### 3.3. Nguyên tắc thiết kế (giữ đúng)
- **Snapshot** đơn hàng; **cached fields incremental** (rating/sold/tồn kho); **atomic SQL** trừ kho/lượt mã; **`@Async`** email+notification; **cross-module qua interface+DTO** (`ProductQueryService`, `FlashSaleQueryService`, `OrderQueryService`...).
- **Bảo mật:** `JwtAuthEntryPoint` → 401 JSON `AUTH_006`; CORS từ env; `GlobalExceptionHandler` trả **400** cho input sai (body JSON/sai kiểu/thiếu tham số) thay vì 500.

### 3.4. AI Gateway (Phase 6)
- Node 20 + Express, port 3001, `/api/ai/chat` + `/api/ai/health`. **Google Gemini** `gemini-2.5-flash`, tắt thinking + `maxOutputTokens=1500`. Lịch sử **session-only**.

### 3.5. ⭐ PHASE 11 — đã làm (mới so với bản review cũ)
**Backend:**
- **Flash sale backend thật** (module `flashsale`, V8): `gia_flash_sale` = **giá cuối khi mua**, chèn vào `GioHangServiceImpl` nên giỏ + đơn dùng chung; voucher vẫn giảm trên tổng. `GET /api/flash-sale`.
- **`/api/san-pham` viết lại** → trả **card theo BIẾN THỂ** (`BienTheCardResponse`, 1 biến thể = 1 card) qua native `findBienTheCards`. Lọc thêm: **tiêu chí JSONB** (`thongSo`, dùng `@>` + GIN), **khuyến mãi** (`khuyenMai`, giá bán < niêm yết), **tag** (`nhan`, vd `noi-bat`); sort thêm **`price_asc/price_desc`**; card có cờ `flashSale` + giá flash.
- **Auto-sync `thong_so_loc`** (`TieuChiSyncService` + 2 endpoint POST): tự sinh filter-schema từ `thuoc_tinh`+`gia_tri_thuoc_tinh` (nguồn tự sinh, **không sửa tay**).
- **+3 handler 400** (input sai).
- **V10 xóa catalog linh kiện/phụ kiện** (giữ lịch sử đơn qua snapshot).

**Frontend:**
- `Container` nới lề; `FilterSidebar` cấu trúc lại (Lọc danh mục → Chọn sản phẩm → Lọc theo tiêu chí **bật thật** → Khoảng giá → Sắp xếp) áp mọi trang listing; `CategoryMenu` **lấy động từ DB**.
- **`BienTheCard`** (card theo biến thể) cho listing + nổi bật; card flash sale dùng **màu Flash Sale** (badge `-X%` đỏ-hồng, giá flash, ⚡); **hiện tất cả nhãn** wrap-layout (bỏ "Sale"); **`DragScroll`** kéo ngang cho Flash Sale + Nổi bật; **Nổi bật = SP gắn tag `noi-bat`**; `ProductDetail` chọn sẵn biến thể qua `?bienThe`.
- Bỏ "Thông báo" khỏi menu tài khoản; căn icon chuông; **xóa mock SP** (productcard **100% từ DB**); ảnh `unoptimized` + fallback.

**Fix lỗi Phase 11:** `42P18` (CAST tham số nullable trong native query); boolean→int native param; ảnh `/_next/image` 500.

---

## 4. Frontend — tổng quan

**Stack:** Next.js 14 App Router + TS + Tailwind. Zustand+persist (5 store) + TanStack Query v5 + axios (JWT auto-refresh) + RHF + Zod + react-hot-toast.

**~19 trang:** Auth (`/dang-nhap`, `/dang-ky`, `/xac-thuc-otp`, `/quen-mat-khau`); Mua sắm (`/`, `/danh-muc/[slug]`, `/tim-kiem`, `/khuyen-mai`, `/san-pham/[slug]`, `/so-sanh`, `/sap-co`); Giao dịch (`/gio-hang`, `/thanh-toan`, `/lich-su-mua-hang`, `/lich-su-mua-hang/[maDonHang]`); Tài khoản (`/tai-khoan`, `/so-dia-chi`, `/thong-bao`, `/danh-gia`).

**Mọi product card lấy 100% từ API/CSDL** (FlashSale, Nổi bật, danh sách, SP tương tự, so sánh). Chỉ còn `HERO_SLIDES` là banner quảng cáo tĩnh (không phải productcard).

---

## 5. Quyết định khóa cứng — **đã có thay đổi**

**Giữ nguyên (9):** SĐT+MK · OTP email 5' · COD only · 1 mã/đơn · không hạng thành viên · không social login · chat session-only · review text-only · 6 tab trạng thái + luồng `CHO_XU_LY→DANG_GIAO→GIAO_THANH_CONG→HOAN_THANH`.

**⚠️ ĐÃ OVERRIDE / quyết định mới (Phase 11):**
- ~~#5 Không có flash-sale ở backend~~ → **OVERRIDE: làm flash sale backend thật** (bảng `flashsale`, giá cuối khi mua).
- **MỚI:** ProductCard = **1 biến thể = 1 card** (listing theo biến thể).
- **MỚI:** `thong_so_loc` là **nguồn tự sinh** (auto-sync từ `thuoc_tinh`/`gia_tri_thuoc_tinh`), không sửa tay.
- **MỚI:** Catalog rút gọn còn **Laptop / PC Gaming / Màn hình** (active) + Linh kiện/Phụ kiện (rỗng, chờ quyết định xóa/giữ).

---

## 6. Đã xử lý & nợ kỹ thuật còn lại

**✅ Đã xử lý trong Phase 11** (trước là "còn nợ"): lọc thuộc tính JSONB · sort theo giá · giá gốc/% giảm trên card · handler body JSON sai → 400 · JWT 401.

**⏳ Nợ / cần lưu ý:**
| # | Vấn đề | Ghi chú |
|---|---|---|
| 1 | Polish giao diện vẫn tiếp tục theo **chỉ đạo từng đợt của user** | Đang làm |
| 2 | **E2E 7 kịch bản** + test nợ Phase 9–10 | Chưa chạy đủ |
| 3 | **N+1** ở `toBienTheCardResponse` (mỗi card: query flash + lazy sanPham/anhs/nhans) | Tối ưu ở 11C |
| 4 | **Redis cache không tự evict** khi đổi catalog (`@Cacheable("danh-muc-cay")`) → phải `redis-cli FLUSHALL` | Cần chiến lược evict |
| 5 | Linh kiện/Phụ kiện **rỗng** sau V10 | ✅ User chốt GIỮ (tạm rỗng, thêm SP sau) |
| 6 | Entity chưa map cột V7; auto-sync endpoint **chưa role-guard** (Admin deferred) | Khi làm Admin |
| 7 | Tiêu chí `gpu/screen` lệch key giữa seed và schema | Lọc `ram/storage/color/cpu` OK |

---

## 7. Tài liệu liên quan
- [TECHSHOP_PROJECT_BRIEF.md](TECHSHOP_PROJECT_BRIEF.md) · [CLAUDE.md](CLAUDE.md) · `KIM CHỈ NAM ... .docx`
- `phase0_tong_ket.md` → `phase10_tong_ket.md`
- [TECHSHOP_KE_HOACH_CON_LAI.md](TECHSHOP_KE_HOACH_CON_LAI.md) — kế hoạch còn lại (Phase 11 còn lại → 13)

---

*File review — TechShop Project · cập nhật tới Phase 11 (đang làm)*
