-- ============================================================
-- V20: Hủy đơn KHÔNG còn tự hoàn kho ngay. Quản trị viên phải xác nhận
--      "hàng đã trở lại kho" như một bước riêng → cột da_hoan_kho.
-- ============================================================

ALTER TABLE don_hang ADD COLUMN da_hoan_kho BOOLEAN NOT NULL DEFAULT false;

-- Đơn đã hủy trước đây đã được hoàn kho tự động (theo logic cũ) → đánh dấu true
-- để admin không hoàn lại lần nữa gây sai tồn.
UPDATE don_hang SET da_hoan_kho = true WHERE trang_thai = 'DA_HUY';
