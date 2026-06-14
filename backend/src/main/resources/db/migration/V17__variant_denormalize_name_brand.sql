-- ============================================================
-- V17: Denormalize tên sản phẩm + thương hiệu xuống bien_the_san_pham.
-- Mục đích: product card chỉ đọc 1 bảng bien_the_san_pham (không JOIN san_pham)
--           → giảm truy vấn nhiều bảng, tăng tốc load trang danh sách.
-- Quy tắc: admin KHÔNG nhập tay 2 trường này; hệ thống tự điền từ san_pham khi
--          tạo biến thể, và tự đồng bộ lại khi sản phẩm đổi tên/thương hiệu.
-- ============================================================

ALTER TABLE bien_the_san_pham ADD COLUMN ten_san_pham VARCHAR(255);
ALTER TABLE bien_the_san_pham ADD COLUMN thuong_hieu  VARCHAR(100);

-- Backfill từ sản phẩm cha cho toàn bộ biến thể hiện có.
UPDATE bien_the_san_pham bt
SET ten_san_pham = sp.ten_san_pham,
    thuong_hieu  = sp.thuong_hieu
FROM san_pham sp
WHERE bt.san_pham_id = sp.id;
