-- ============================================================
-- V16: chi_tiet_don_hang thêm thuong_hieu (snapshot thương hiệu lúc mua)
--      để chi tiết đơn hiển thị đầy đủ: tên SP, hãng, thông số biến thể, màu.
-- (danh_gia_media và don_hang.ly_do_huy đã có sẵn từ trước.)
-- ============================================================

ALTER TABLE chi_tiet_don_hang ADD COLUMN thuong_hieu VARCHAR(100);

-- Backfill best-effort từ sản phẩm qua biến thể (đơn cũ).
UPDATE chi_tiet_don_hang ct SET thuong_hieu = sp.thuong_hieu
FROM bien_the_san_pham bt
JOIN san_pham sp ON bt.san_pham_id = sp.id
WHERE ct.bien_the_id = bt.id AND ct.thuong_hieu IS NULL;
