-- ============================================================
-- V15:
-- 1. san_pham: thêm anh_dai_dien (1 ảnh/sp — dùng cho trang quản lý + banner).
-- 2. anh_san_pham: hủy liên kết san_pham → ảnh chỉ thuộc biến thể (nhiều ảnh/biến thể).
-- 3. Bỏ bảng pivot bien_the_gia_tri_thuoc_tinh (giá trị thuộc tính lấy từ
--    chi_tiet_thuoc_tinh_loc.thong_so_loc — bảng pivot không còn chức năng).
-- 4. bien_the_san_pham: thêm so_luot_danh_gia; lượt đánh giá sản phẩm = tổng của các biến thể.
-- ============================================================

-- ─── 1. Ảnh đại diện sản phẩm ───────────────────────────────
ALTER TABLE san_pham ADD COLUMN anh_dai_dien VARCHAR(500);

-- Backfill: ưu tiên ảnh chính cấp sản phẩm (bien_the_id NULL), sau đó ảnh chính của biến thể.
UPDATE san_pham sp SET anh_dai_dien = (
    SELECT a.url_anh FROM anh_san_pham a
    WHERE a.san_pham_id = sp.id AND a.bien_the_id IS NULL
    ORDER BY a.la_anh_chinh DESC, a.thu_tu ASC NULLS LAST
    LIMIT 1);
UPDATE san_pham sp SET anh_dai_dien = (
    SELECT a.url_anh FROM anh_san_pham a
    JOIN bien_the_san_pham bt ON a.bien_the_id = bt.id
    WHERE bt.san_pham_id = sp.id
    ORDER BY a.la_anh_chinh DESC, a.thu_tu ASC NULLS LAST
    LIMIT 1)
WHERE sp.anh_dai_dien IS NULL;

-- ─── 2. anh_san_pham chỉ thuộc biến thể ─────────────────────
DELETE FROM anh_san_pham WHERE bien_the_id IS NULL;       -- ảnh cấp SP đã chuyển sang anh_dai_dien
ALTER TABLE anh_san_pham DROP COLUMN san_pham_id;         -- bỏ FK + index idx_anh_san_pham_sp
ALTER TABLE anh_san_pham ALTER COLUMN bien_the_id SET NOT NULL;

-- ─── 3. Bỏ bảng pivot không dùng ────────────────────────────
DROP TABLE IF EXISTS bien_the_gia_tri_thuoc_tinh;

-- ─── 4. Lượt đánh giá theo biến thể ─────────────────────────
ALTER TABLE bien_the_san_pham ADD COLUMN so_luot_danh_gia INT NOT NULL DEFAULT 0;

-- Đánh giá cũ chưa gắn biến thể → gán cho biến thể mặc định của sản phẩm
-- (giữ "lượt đánh giá sản phẩm = tổng lượt đánh giá biến thể").
UPDATE danh_gia dg SET bien_the_id = (
    SELECT bt.id FROM bien_the_san_pham bt
    WHERE bt.san_pham_id = dg.san_pham_id
    ORDER BY bt.la_bien_the_mac_dinh DESC NULLS LAST, bt.id ASC
    LIMIT 1)
WHERE dg.bien_the_id IS NULL;

-- Đếm lượt đánh giá đã duyệt theo biến thể.
UPDATE bien_the_san_pham bt SET so_luot_danh_gia = (
    SELECT COUNT(*) FROM danh_gia dg
    WHERE dg.bien_the_id = bt.id AND dg.trang_thai = 'DA_DUYET');

-- Lượt đánh giá sản phẩm = tổng của các biến thể.
UPDATE san_pham sp SET so_luot_danh_gia = COALESCE((
    SELECT SUM(bt.so_luot_danh_gia) FROM bien_the_san_pham bt
    WHERE bt.san_pham_id = sp.id), 0);
