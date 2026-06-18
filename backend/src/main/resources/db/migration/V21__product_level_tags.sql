-- ============================================================
-- V21: Gắn thẻ ở cấp SẢN PHẨM. nhan_ids (JSONB mảng id nhãn) là nguồn chuẩn
--      do form sản phẩm chọn; hệ thống áp xuống TẤT CẢ biến thể (bien_the_nhan
--      + bien_the_gan_nhan) để card hiển thị. Biến thể mới kế thừa thẻ của sản phẩm.
-- ============================================================

ALTER TABLE san_pham ADD COLUMN nhan_ids JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Backfill: gom (union) thẻ hiện có của các biến thể lên sản phẩm.
UPDATE san_pham sp SET nhan_ids = COALESCE((
    SELECT jsonb_agg(DISTINCT bn.nhan_id)
    FROM bien_the_san_pham bt
    JOIN bien_the_nhan bn ON bn.bien_the_id = bt.id
    WHERE bt.san_pham_id = sp.id
), '[]'::jsonb);
