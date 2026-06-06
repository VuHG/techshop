# TECHSHOP — KẾ HOẠCH CHI TIẾT NHỮNG NHIỆM VỤ CHƯA LÀM

> **Cập nhật:** 2026-05-31 · bám sát thực trạng sau loạt commit Phase 11 (`d71e1fa`→`e3a77e5`).
> **Phạm vi:** hoàn tất **Phase 11** (phần còn lại) → **Phase 12** Deploy → **Phase 13** Monitoring. Phần đã làm xem [TECHSHOP_REVIEW.md](TECHSHOP_REVIEW.md).
> **Nếp làm việc:** code trên Windows → push `develop` → pull + chạy trên Ubuntu → test → commit Conventional Commits.

---

## ✅ PHASE 11 — ĐÃ LÀM ĐƯỢC PHẦN LỚN

| Hạng mục | Trạng thái |
|---|---|
| Restructure UI listing (FilterSidebar, danh mục động, nới lề) | ✅ |
| **Flash sale backend** (bảng + giá cuối + FE màu flash + kéo ngang) | ✅ |
| **Card theo biến thể** (`/api/san-pham` trả `BienTheCardResponse`) | ✅ |
| **Lọc nâng cao**: tiêu chí JSONB + khuyến mãi + tag + **sort giá** | ✅ |
| **Auto-sync `thong_so_loc`** từ thuộc tính | ✅ |
| Hiện tất cả nhãn (wrap, bỏ Sale) + badge % đỏ-hồng + căn icon chuông | ✅ |
| **Sản phẩm nổi bật = tag `noi-bat`**; productcard 100% từ DB (bỏ mock) | ✅ |
| Schema align thiết kế gốc (V7); rút gọn catalog (V10) | ✅ |
| Handler 400 cho input sai; fix native query / ảnh | ✅ |

---

## 🔄 PHASE 11 — CÒN LẠI

### 11-a. Polish giao diện (tiếp, theo chỉ đạo từng đợt của user)
- User chỉ chỗ → sửa đúng yêu cầu (đã làm nhiều đợt). Tiếp tục: rà responsive mobile thật, đồng bộ spacing/màu, trạng thái loading/empty/error còn thiếu (phần lớn đã có từ Phase 9–10).
- ✅ **Đã chốt (2026-05-31):** **GIỮ** Linh kiện & Phụ kiện (không xóa thêm) — tạm rỗng, sẽ thêm sản phẩm sau.

### 11-b. E2E — 7 kịch bản (gồm test nợ Phase 9–10)
3 terminal (BE:8080, FE:3000, AI:3001) + env `CORS_ORIGINS`/`NEXT_PUBLIC_AI_URL`.
1. Khách duyệt + lọc (phân loại/giá/tiêu chí/tag/sort/phân trang) — **card theo biến thể**.
2. So sánh (≤3 cùng phân loại).
3. Đăng ký → OTP → đăng nhập → đăng xuất → đăng nhập lại.
4. Quên mật khẩu (SĐT→OTP→đặt lại).
5. **Mua COD** (gồm SP **flash sale** → giá giỏ = giá flash) → đơn `Chờ xử lý`, kho −1, lượt mã +1.
6. Hủy đơn → `Đã hủy`, hoàn kho + hoàn lượt mã.
7. Đánh giá đơn HOAN_THANH; chuông +1; chatbot trả lời.

### 11-c. Performance
- **N+1** ở `toBienTheCardResponse` (mỗi card: query flash sale + lazy `sanPham`/`anhs`/`nhans`) → cân nhắc batch/fetch-join hoặc gộp truy vấn flash sale.
- **Chiến lược evict Redis cache** khi đổi catalog/sản phẩm (`@Cacheable("danh-muc-cay")`, `san-pham-chi-tiet`) — hiện phải `FLUSHALL` thủ công. Khi làm Admin: `@CacheEvict` trên thao tác ghi.
- FE: `next/image` (đang `unoptimized` vì ảnh seed giả — khi có ảnh thật thì bật tối ưu + remotePatterns CDN), code-split, **Lighthouse** > 80.

### 11-d. Security (rà checklist)
- [ ] **Phân quyền user-scope**: gọi `/api/don-hang/{id}` của user khác → 403/404 (đa số đã scope theo `nguoiDungId`).
- [ ] Endpoint **auto-sync tiêu chí** (`/api/tieu-chi/dong-bo-tat-ca`) hiện chỉ cần JWT → thêm **role guard Admin** khi có Admin.
- [ ] JWT secret ≥32 ký tự (prod), CORS đúng origin, không log nhạy cảm, không lộ stack trace.
- [x] Handler input sai → 400 (đã làm).

**Kết Phase 11:** commit `test(phase11): e2e + performance + security`; tạo `phase11_tong_ket.md`.

---

## 🧱 NỢ KỸ THUẬT (ghi để không quên)
1. **Redis cache không tự evict** khi đổi catalog → cần `@CacheEvict` (hoặc TTL) khi làm Admin/ghi dữ liệu.
2. **N+1** card theo biến thể (mục 11-c).
3. **Entity Java chưa map các cột V7** (gioi_tinh, ma_thuoc_tinh, ten_bien_the, la_bien_the_mac_dinh, trang_thai_thanh_toan...) — bổ sung khi làm Admin.
4. Tiêu chí `gpu/screen` lệch key giữa seed (`card_do_hoa`/`man_hinh`) và schema (`gpu`/`screen`) → lọc `ram/storage/color/cpu` chạy đúng, 2 cái kia chưa.
5. **Linh kiện/Phụ kiện rỗng** sau V10 (chờ quyết định).
6. Module **Admin hoàn toàn chưa làm** (auto-sync tiêu chí, duyệt thuộc tính, quản lý flash sale... để sẵn schema, chưa có UI/role).

---

## PHASE 12 — DEPLOYMENT LÊN VPS
**Mục tiêu:** `https://<domain>`, tổng RAM < 1.5GB (VPS 2GB/3CPU).
- **12A** Chuẩn bị VPS Ubuntu 22.04 + domain; user `deploy`, `ufw` 22/80/443, tắt root SSH, `fail2ban`, cài Docker Compose.
- **12B** Dockerfile backend (JRE21, `-Xmx400m`), frontend (node20 multi-stage), ai-gateway; `docker-compose.prod.yml` giới hạn RAM (pg 256M, redis 128M, backend 512M, fe 256M, ai 128M ≈ 1.28GB). `.env.prod` (DB/JWT/SendGrid/Gemini/domain/CORS). Flyway tự migrate (V1–V10).
- **12C** Nginx reverse proxy (`/`, `/api/`, `/ai/`) + gzip + rate-limit + SSL Let's Encrypt; CI/CD `.github/workflows/deploy.yml`.
- ⚠️ **Lưu ý mới:** flash sale nằm **trong backend** (không thêm service deploy). Cần **chiến lược evict Redis** ở prod khi sửa catalog.

**Kiểm thử:** `https://<domain>` mở được, HTTPS hợp lệ, `docker stats` < 1.5GB, smoke test API.

---

## PHASE 13 — MONITORING & DEMO
- **13A** `GET /api/health` (DB/Redis/disk) + UptimeRobot + Sentry + cron `pg_dump` (giữ 7 ngày).
- **13B** Checklist demo (tài khoản demo đủ 6 trạng thái đơn; vài SP có **ảnh thật**; kịch bản duyệt→lọc→so sánh→mua COD→đánh giá→chatbot; slide kiến trúc; giải thích quyết định khóa cứng **+ các quyết định Phase 11 đã đổi**; số liệu **28 bảng / ~44 endpoint / ~19 trang**).

---

## DÒNG THỜI GIAN
```
Phase 11 còn lại (E2E + perf + security + polish)  ██████   ~ vừa (đã làm phần lớn)
Phase 12 (Deploy)                                  ██████   ~ vừa — cần VPS + domain
Phase 13 (Monitor + Demo)                          ████     ~ nhẹ
```

**Ưu tiên kế tiếp (chờ user chốt):** (1) polish UI tiếp theo note / (2) E2E + performance + security / (3) Phase 12 Deploy.

---

*File kế hoạch — TechShop Project · cập nhật sau Phase 11*
