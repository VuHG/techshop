-- ============================================================
-- V19: Denormalize ảnh chính của biến thể xuống bien_the_san_pham.anh_bien_the_san_pham.
-- Giá trị = anh_san_pham.url_anh có thu_tu = 0 (ảnh đầu = ảnh chính).
-- Đổi quy ước thu_tu sang 0-based để khớp (trước đây bắt đầu từ 1).
-- Hệ thống tự đồng bộ khi lưu/xóa ảnh; xóa ảnh thứ tự n → các ảnh > n tụt 1.
-- ============================================================

-- 1. Re-sequence thu_tu về 0-based theo từng biến thể (ảnh chính/đầu = 0, liên tục).
WITH seq AS (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY bien_the_id
                              ORDER BY la_anh_chinh DESC, thu_tu ASC NULLS LAST, id ASC) - 1 AS rn
    FROM anh_san_pham
)
UPDATE anh_san_pham a SET thu_tu = seq.rn
FROM seq WHERE a.id = seq.id;

-- Đồng bộ cờ la_anh_chinh theo thu_tu mới (0 = ảnh chính).
UPDATE anh_san_pham SET la_anh_chinh = (thu_tu = 0);

-- 2. Thêm cột ảnh chính denormalized + backfill từ ảnh thu_tu = 0.
ALTER TABLE bien_the_san_pham ADD COLUMN anh_bien_the_san_pham VARCHAR(500);

UPDATE bien_the_san_pham bt
SET anh_bien_the_san_pham = (
    SELECT a.url_anh FROM anh_san_pham a
    WHERE a.bien_the_id = bt.id AND a.thu_tu = 0
    LIMIT 1);
