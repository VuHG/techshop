# Tổng kết Role Người dùng (Khách hàng) — TechShop

> Tài liệu tổng hợp toàn bộ tính năng phía **khách hàng** (storefront) đã hoàn thiện.
> Stack: Next.js 14 (App Router) + TanStack Query + Zustand · Backend Spring Boot 3 / PostgreSQL 16.

---

## 1. Tài khoản & Xác thực
- **Đăng ký** bằng **số điện thoại + mật khẩu**; xác thực **OTP 6 số gửi qua email** (hết hạn 5 phút).
- **Đăng nhập** bằng SĐT + mật khẩu; **JWT** (access 15 phút, refresh 7 ngày) — tự refresh khi 401.
- **Quên mật khẩu** qua OTP email.
- **Đổi tài khoản**: khi đăng nhập/đăng xuất, dữ liệu phiên cũ (so sánh, giỏ-badge, lựa chọn thanh toán) **tự xóa** để không dính sang tài khoản mới.

## 2. Trang chủ & Khám phá sản phẩm
- **Flash Sale** (đếm ngược, giá flash), **sản phẩm nổi bật**, **mega-menu danh mục**.
- **Danh sách / Tìm kiếm / Khuyến mãi**: hiển thị theo **biến thể** (mỗi biến thể 1 card).
  - **Lọc**: danh mục → phân loại, khoảng giá, **thông số (JSONB)**, nhãn.
  - **Sắp xếp**: mới nhất / bán chạy / giá tăng-giảm / đánh giá. Phân trang.
  - Sản phẩm **hết hàng vẫn hiển thị** (mờ + "Sản phẩm đang hết"), xếp sau hàng còn.
- **Ô tìm kiếm**: gợi ý theo sản phẩm; bấm gợi ý → ra **trang kết quả hiển thị toàn bộ biến thể**.

### ProductCard hiển thị
Tên sản phẩm · **thương hiệu** · **toàn bộ thông số** · giá khuyến mãi + giá gốc · **đánh giá** · **trạng thái** (Còn/Hết hàng — lấy từ `bien_the_san_pham`).

## 3. Chi tiết sản phẩm
- **Gallery ảnh theo biến thể**; ảnh đại diện sản phẩm dự phòng.
- **Chọn phiên bản 2 cấp**: cấu hình (chuỗi thông số) → màu → ra đúng biến thể (đọc từ `san_pham.ban_do_bien_the`). Biến thể hết hàng vẫn chọn xem được (vô hiệu mua).
- Giá khuyến mãi + giá gốc, **bảng thông số** của biến thể đang chọn + màu.
- **Hết hàng**: nút Thêm giỏ / Mua ngay **bị vô hiệu**, ảnh phủ chữ đỏ "Sản phẩm đang hết".
- **Sản phẩm tương tự**, **so sánh sản phẩm** (tối đa 3, cùng phân loại).

## 4. Giỏ hàng & Mua hàng
- **Thêm vào giỏ / Mua ngay** ngay từ card (modal chọn **thông số + màu** + số lượng).
- Giỏ hàng: chọn item, đổi số lượng, xóa; **áp mã giảm giá**:
  - Mã **theo sản phẩm** → trừ thẳng vào từng sản phẩm (hiện ô "-tiền" dưới sản phẩm).
  - Mã **theo đơn** → trừ tổng đơn.
- **Thanh toán**: chọn địa chỉ (mặc định), **COD**, ghi chú; đặt hàng tạo đơn + **trừ tồn atomic** (hết tồn → biến thể `HET_HANG`).

## 5. Đơn hàng
- **Lịch sử** theo 6 tab trạng thái; **chi tiết đơn** (snapshot: tên SP, **hãng**, toàn bộ thông số + **màu**, giá lúc mua, giảm theo sản phẩm).
- **Bản vẽ trạng thái (timeline)**.
- **Hủy đơn kèm lý do** (chỉ khi Chờ xử lý) → hoàn tồn + hoàn lượt mã; hiện banner "Lý do hủy".
- **Xác nhận đã nhận hàng** (Giao thành công → Hoàn thành), **Mua lại**.

## 6. Đánh giá
- Gửi đánh giá **sau khi đơn HOÀN THÀNH** (mỗi SP/đơn 1 lần): số sao + nội dung + **nhiều ảnh/video minh họa (URL)**.
- Mỗi đánh giá tăng **lượt đánh giá của biến thể** (SP = tổng các biến thể); **xóa đánh giá** → giảm tương ứng + đảo điểm trung bình.
- **Lịch sử đánh giá của tôi**: bấm 1 đánh giá → mở **trang sản phẩm**, **cuộn tới đúng vị trí** đánh giá và **highlight 1 nhịp** rồi tắt.

## 7. Tài khoản cá nhân
- **Ảnh đại diện (avatar)** + **chế độ XEM** thông tin, nút **Sửa** mới chuyển form chỉnh.
- **Địa chỉ của tôi**: nhiều địa chỉ nhưng **chỉ 1 đang dùng = địa chỉ mặc định** (badge "Đang sử dụng", nút "Dùng địa chỉ này").
- **Thông báo**, **Chatbot AI tư vấn** (session-only).

## 8. Tự làm mới dữ liệu (mới)
- Sau **mọi thao tác ghi DB** (mua hàng, hủy, đánh giá, sửa hồ sơ/địa chỉ, giỏ hàng…), hệ thống **tự invalidate toàn bộ query** → trang refetch và hiển thị **đúng với cơ sở dữ liệu** (cài đặt tại axios interceptor + QueryClient dùng chung). Server cũng **evict cache** chi tiết sản phẩm khi tồn kho đổi.

---

## Quyết định kỹ thuật chính (liên quan khách hàng)
| Mục | Lựa chọn |
|---|---|
| Đăng nhập | SĐT + mật khẩu |
| OTP | 6 số qua **email**, 5 phút |
| Thanh toán | **COD** (MVP) |
| Voucher | 1 mã/đơn; theo sản phẩm hoặc theo đơn |
| Ảnh (sản phẩm/avatar/đánh giá) | **URL** (không upload file) |
| Đơn hàng | **Snapshot** giá/tên/hãng/thông số/màu lúc mua — không JOIN lại |
| Trạng thái biến thể | CON_HANG / HET_HANG (tự đổi theo tồn) / NGUNG_BAN (ẩn) |

## Trạng thái triển khai
- Toàn bộ code đã đẩy lên nhánh `develop` (GitHub: VuHG/techshop).
- Schema cơ sở dữ liệu: migrations **V1–V16** (xem [techshop_schema.dbml](techshop_schema.dbml)).
- Các đợt gần đây **không thêm bảng/cột mới** ngoài V16 (`chi_tiet_don_hang.thuong_hieu`); tính năng avatar/ảnh-video đánh giá/lý do hủy **tái dùng cột có sẵn** (`avatar_url`, `danh_gia_media`, `ly_do_huy`).
