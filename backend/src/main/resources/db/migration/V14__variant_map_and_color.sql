-- ============================================================
-- V14: Bản đồ biến thể + màu sắc/lượt bán theo biến thể
-- 1. san_pham: đổi tên thong_so_ky_thuat → ban_do_bien_the và đổi ý nghĩa.
--    Sản phẩm KHÔNG còn thông số chung. ban_do_bien_the (JSONB) là sơ đồ phiên bản:
--      { "<chuỗi thông số>": { "<màu>": <id biến thể> } }
--    VD: { "Intel Core 7 / 16GB / 512GB": { "Đen": 12, "Bạc": 13 } }
-- 2. bien_the_san_pham: thêm mau_sac + so_luot_ban; tách màu khỏi thong_so_bien_the.
-- ============================================================

-- ─── 1. san_pham ────────────────────────────────────────────
ALTER TABLE san_pham RENAME COLUMN thong_so_ky_thuat TO ban_do_bien_the;

-- ─── 2. bien_the_san_pham: cột mới ──────────────────────────
ALTER TABLE bien_the_san_pham ADD COLUMN mau_sac     VARCHAR(50);
ALTER TABLE bien_the_san_pham ADD COLUMN so_luot_ban INT NOT NULL DEFAULT 0;

-- ─── 3. Tách màu từ thong_so_bien_the sang cột mau_sac ──────
UPDATE bien_the_san_pham
SET mau_sac = COALESCE(
        thong_so_bien_the->>'color',
        thong_so_bien_the->>'mau_sac',
        thong_so_bien_the->>'mauSac',
        thong_so_bien_the->>'Màu sắc')
WHERE mau_sac IS NULL;

UPDATE bien_the_san_pham
SET thong_so_bien_the = thong_so_bien_the - ARRAY['color', 'mau_sac', 'mauSac', 'Màu sắc'];

-- ─── 4. Dựng ban_do_bien_the từ biến thể hiện có ────────────
-- Chuỗi thông số = các value của thong_so_bien_the nối bằng ' / ', sắp theo key
-- (phải khớp logic buildChuoiThongSo trong AdminSanPhamService).
WITH spec AS (
    SELECT bt.id,
           bt.san_pham_id,
           COALESCE(NULLIF(bt.mau_sac, ''), '—') AS color,
           COALESCE((SELECT string_agg(value, ' / ' ORDER BY key)
                     FROM jsonb_each_text(bt.thong_so_bien_the)), '') AS specstr
    FROM bien_the_san_pham bt
),
colormap AS (
    SELECT san_pham_id, specstr, jsonb_object_agg(color, id) AS cm
    FROM spec GROUP BY san_pham_id, specstr
),
prodmap AS (
    SELECT san_pham_id, jsonb_object_agg(specstr, cm) AS pm
    FROM colormap GROUP BY san_pham_id
)
UPDATE san_pham sp SET ban_do_bien_the = prodmap.pm
FROM prodmap WHERE sp.id = prodmap.san_pham_id;

-- Sản phẩm chưa có biến thể → {} thay vì NULL.
UPDATE san_pham SET ban_do_bien_the = '{}'::jsonb WHERE ban_do_bien_the IS NULL;
