# TECHSHOP — CHECKLIST E2E 7 KỊCH BẢN (Phase 11-b)

> Mục tiêu: kiểm thử end-to-end luồng khách + khách hàng trên môi trường thật (2 máy).
> Đánh ✅/❌ vào cột **KQ** sau mỗi bước. Lỗi → ghi log console + Network.

---

## 0. Chuẩn bị môi trường

**Trên Ubuntu — 3 service chạy (xem [QUY_TRINH_VA_TROUBLESHOOTING.md] nếu quên):**
```bash
# Docker postgres + redis đang chạy: docker ps
# T1 backend (dev-mode để OTP log ra console):
cd ~/projects/techshop/backend && CORS_ORIGINS="http://192.168.211.131:3000" MAIL_DEV_MODE=true mvn spring-boot:run
# T2 ai-gateway:
cd ~/projects/techshop/ai-gateway && npm run dev
# T3 frontend:
cd ~/projects/techshop/frontend && npm run dev -- -H 0.0.0.0
```
- Trình duyệt Windows: `http://192.168.211.131:3000` (thay IP thật). F12 mở sẵn Console + Network.
- **OTP**: ở dev-mode/đăng ký không email → OTP **in ra console terminal backend** (dòng `[DEV] OTP ...`).

**Mở psql để kiểm tra DB + set dữ liệu test:**
```bash
docker exec -it $(docker ps --filter name=postgres -q) psql -U techshop -d techshop
```

**Lệnh SQL trợ giúp (dùng xuyên suốt):**
```sql
-- Xem mã giảm giá có sẵn (lấy 1 mã còn lượt để test)
SELECT id, ma, loai_giam, gia_tri_giam, so_luong_da_dung, so_luong_toi_da FROM ma_giam_gia;

-- Xem tồn kho 1 biến thể trước/sau khi mua
SELECT id, ma_bien_the, so_luong_ton FROM bien_the_san_pham WHERE id = :bienTheId;

-- Xem biến thể đang flash sale (để test KB5 giá flash)
SELECT f.bien_the_id, f.gia_flash_sale, f.thoi_gian_bat_dau, f.thoi_gian_ket_thuc, f.trang_thai
FROM flashsale f
WHERE f.trang_thai = 'HOAT_DONG' AND now() BETWEEN f.thoi_gian_bat_dau AND f.thoi_gian_ket_thuc;

-- (KB7) Đẩy đơn sang GIAO_THANH_CONG để khách bấm "Đã nhận hàng" → HOAN_THANH → mới đánh giá được
UPDATE don_hang SET trang_thai = 'GIAO_THANH_CONG' WHERE ma_don_hang = 'TKxxxxxxxxxNNN';

-- Xem trạng thái + tổng đơn
SELECT ma_don_hang, trang_thai, tong_thanh_toan, ma_giam_gia_id FROM don_hang ORDER BY id DESC LIMIT 5;
```

---

## KB1 — Khách duyệt + lọc (card theo biến thể)

| # | Bước | Kỳ vọng | KQ |
|---|---|---|---|
|1| Vào trang chủ `/` | Hero, Flash Sale (kéo ngang), Sản phẩm nổi bật hiển thị, ảnh load | |
|2| Header "Danh mục" → **Laptop** | Vào `/danh-muc/laptop`, lưới **card theo biến thể** (mỗi biến thể 1 card) | |
|3| Sidebar: chọn 1 **phân loại** | Kết quả lọc đúng phân loại | |
|4| Chọn 1 **tiêu chí** (vd RAM 16GB) | Chỉ còn biến thể có ram=16GB | |
|5| Nhập **khoảng giá** → Áp dụng | Chỉ còn SP trong khoảng | |
|6| Đổi **Sắp xếp**: Giá thấp→cao, cao→thấp | Thứ tự giá đúng | |
|7| **Phân trang** (nếu >12) | Trang 2 đổi nội dung, giữ bộ lọc | |
|8| Trang **Khuyến mãi** `/khuyen-mai` | Chỉ biến thể có giá bán < giá niêm yết; badge % đỏ-hồng | |
|9| Sản phẩm **flash sale**: giá + badge ⚡ | Giá flash + nền gradient flash đúng | |
|10| **Mobile** (DevTools ≤lg): nút "Bộ lọc" → drawer | Lọc được trên mobile | |
|11| `/danh-muc/linh-kien` hoặc `/danh-muc/phu-kien` | Có phân loại (sau V11) nhưng chưa có SP → mỗi phân loại hiện "không có sản phẩm" | |

---

## KB2 — So sánh (≤3 cùng phân loại)

| # | Bước | Kỳ vọng | KQ |
|---|---|---|---|
|1| Vào `/so-sanh` khi chưa chọn | 3 ô trống có dấu **+ Chọn sản phẩm so sánh** | |
|2| Bấm 1 ô → modal "Chọn sản phẩm so sánh" | Tìm kiếm + chọn **bất kỳ** SP (lượt đầu) | |
|3| Thêm SP thứ 2 | Modal "tương quan" → **chỉ** SP cùng phân loại mốc | |
|4| Thử thêm SP **khác phân loại** (từ trang chi tiết SP khác loại, bấm "So sánh") | Báo "Chỉ so sánh được sản phẩm tương quan…", **không** thêm | |
|5| Bảng so sánh: tick "Chỉ hiện điểm khác biệt" | Ẩn các dòng giống nhau | |
|6| Xóa **SP mốc** (ô đầu) | SP kế dồn lên làm mốc; thêm tiếp lọc theo mốc mới | |
|7| Thanh CompareBar dưới đáy: bấm ô **+** | Mở modal chọn SP tương quan | |

---

## KB3 — Đăng ký → OTP → đăng nhập → đăng xuất → đăng nhập lại

| # | Bước | Kỳ vọng | KQ |
|---|---|---|---|
|1| `/dang-ky`: Họ tên, **SĐT mới**, (bỏ trống email), ngày sinh, mật khẩu | Submit thành công, chuyển sang nhập OTP | |
|2| Xem **console backend** lấy OTP (`[DEV] OTP ...`) | Có dòng OTP cho SĐT vừa đăng ký | |
|3| Nhập OTP đúng | Xác thực thành công | |
|4| `/dang-nhap`: SĐT + mật khẩu | Đăng nhập OK, header hiện tên/tài khoản | |
|5| Đăng xuất | Về trạng thái khách, mất menu tài khoản | |
|6| Đăng nhập lại | OK | |
|7| (Âm tính) Sai mật khẩu | Báo lỗi rõ ràng, không vào được | |
|8| (Âm tính) OTP sai/hết hạn (5') | Báo lỗi, không xác thực | |

---

## KB4 — Quên mật khẩu (SĐT → OTP → đặt lại)

| # | Bước | Kỳ vọng | KQ |
|---|---|---|---|
|1| `/quen-mat-khau`: nhập SĐT đã đăng ký | Gửi OTP (console backend) | |
|2| Lấy OTP từ console → nhập | OTP hợp lệ | |
|3| Đặt mật khẩu mới | Thành công | |
|4| Đăng nhập bằng **mật khẩu mới** | OK | |
|5| (Âm tính) Đăng nhập mật khẩu **cũ** | Thất bại | |

---

## KB5 — Mua COD (gồm SP flash sale)

> Trước khi mua: ghi lại **tồn kho** biến thể (SQL) + lượt dùng **voucher**.

| # | Bước | Kỳ vọng | KQ |
|---|---|---|---|
|1| Đăng nhập. Thêm vào giỏ 1 SP thường + 1 SP **flash sale** | Badge giỏ tăng | |
|2| `/gio-hang`: SP flash sale có **giá = giá flash** (không phải giá niêm yết) | Giá giỏ = `gia_flash_sale` | |
|3| Nhập **mã giảm giá** hợp lệ → Áp dụng | Trừ tiền đúng loại mã | |
|4| Sang `/thanh-toan`: chọn địa chỉ (hoặc nhập tay) | Tóm tắt đúng tạm tính/ship/giảm/tổng | |
|5| COD là phương thức duy nhất bật | 2 phương thức kia "sắp có" (disabled) | |
|6| Đặt hàng | "Đặt hàng thành công" + mã đơn `TK...` | |
|7| `/lich-su-mua-hang`: đơn ở tab **Chờ xử lý** | Trạng thái `CHO_XU_LY` | |
|8| SQL: tồn kho biến thể **−1** (đúng số lượng mua) | `so_luong_ton` giảm đúng | |
|9| SQL: `so_luong_da_dung` của mã **+1** | Lượt dùng mã tăng | |
|10| (Mua nhanh) Bấm **"Mua ngay"** trên card → form → "Mua hàng" | Vào thẳng `/thanh-toan` đúng biến thể/số lượng | |

---

## KB6 — Hủy đơn (hoàn kho + hoàn lượt mã)

| # | Bước | Kỳ vọng | KQ |
|---|---|---|---|
|1| Mở đơn `CHO_XU_LY` ở KB5 → **Hủy đơn** | Xác nhận hủy | |
|2| Trạng thái đơn → **Đã hủy** (`DA_HUY`) | Tab "Đã hủy" có đơn | |
|3| SQL: tồn kho biến thể **hoàn lại** (về như trước khi mua) | `so_luong_ton` tăng lại | |
|4| SQL: `so_luong_da_dung` của mã **−1** (hoàn lượt) | Lượt mã trả lại | |
|5| (Âm tính) Thử hủy đơn **không** ở `CHO_XU_LY` | Bị chặn (ORD_002) | |
|6| Chuông thông báo: có thông báo "Đã hủy đơn hàng" | Badge tăng | |

---

## KB7 — Đánh giá đơn HOAN_THANH + chuông + chatbot

> Cần 1 đơn `HOAN_THANH`. Vì chưa có Admin, dùng SQL đẩy đơn sang `GIAO_THANH_CONG` rồi khách tự xác nhận.

| # | Bước | Kỳ vọng | KQ |
|---|---|---|---|
|1| Tạo đơn COD mới (như KB5, **không hủy**) | Đơn `CHO_XU_LY` | |
|2| SQL: `UPDATE don_hang SET trang_thai='GIAO_THANH_CONG' WHERE ma_don_hang='TK...';` | Đơn sang Đang giao thành công | |
|3| `/lich-su-mua-hang` → mở đơn → **"Đã nhận hàng"** | Đơn → **Hoàn thành** (`HOAN_THANH`) | |
|4| Bấm **Đánh giá** (từ đơn hoàn thành) → chọn sao + nội dung → gửi | Đánh giá thành công | |
|5| Vào trang sản phẩm đó | Thấy đánh giá vừa gửi; `diem_danh_gia_tb`/`so_luot_danh_gia` cập nhật | |
|6| Chuông 🔔: có thông báo "Đơn hàng hoàn thành" | Badge +1; **rê chuột** qua → tự đánh dấu đã đọc | |
|7| **Chatbot** (góc phải): hỏi "Tư vấn laptop lập trình dưới 20 triệu" | AI trả lời + **hiện product card** gợi ý; bấm card → mở đúng SP | |
|8| Chatbot hỏi câu ngoài phạm vi (vd "thời tiết") | Lịch sự từ chối, hướng về sản phẩm | |

---

## Tổng kết

| KB | Tên | Pass? | Ghi chú lỗi |
|---|---|---|---|
|1| Duyệt + lọc | | |
|2| So sánh | | |
|3| Đăng ký/đăng nhập | | |
|4| Quên mật khẩu | | |
|5| Mua COD + flash sale | | |
|6| Hủy đơn | | |
|7| Đánh giá + chuông + chatbot | | |

> Sau khi pass hết: commit `test(phase11): e2e pass` và chuyển **Phase 12 — Deploy**.
> Lỗi lặp lại → ghi vào QUY_TRINH_VA_TROUBLESHOOTING.md để không quên.
