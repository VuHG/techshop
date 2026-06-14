-- ============================================================
-- V18: Denormalize nhãn xuống bien_the_san_pham.bien_the_gan_nhan (JSONB).
-- Cấu trúc: { "<nhan_id>": [ten_nhan, mau_sac, thu_tu_hien_thi, trang_thai] }
-- Mục đích: product card đọc nhãn ngay trong bien_the_san_pham, không JOIN
--           bien_the_nhan + nhan_san_pham → tối ưu truy vấn.
-- Hệ thống tự cập nhật: khi gắn nhãn cho biến thể, và khi nhan_san_pham đổi.
-- ============================================================

ALTER TABLE bien_the_san_pham ADD COLUMN bien_the_gan_nhan jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Backfill từ bien_the_nhan + nhan_san_pham cho biến thể hiện có.
UPDATE bien_the_san_pham bt
SET bien_the_gan_nhan = COALESCE((
    SELECT jsonb_object_agg(
               n.id::text,
               jsonb_build_array(n.ten_nhan, n.mau_sac, n.thu_tu_hien_thi, n.trang_thai))
    FROM bien_the_nhan bn
    JOIN nhan_san_pham n ON bn.nhan_id = n.id
    WHERE bn.bien_the_id = bt.id
), '{}'::jsonb);
