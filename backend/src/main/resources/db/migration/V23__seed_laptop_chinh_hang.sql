-- ============================================================
-- V23: Thêm danh mục con "Laptop chính hãng" (con của "Laptop"),
--      phân loại "Laptop A" trong danh mục đó, kèm thuộc tính + giá trị.
--      Định danh theo slug để tránh nhầm.
-- ============================================================

-- 1) Danh mục con "Laptop chính hãng" dưới "Laptop" (slug 'laptop').
INSERT INTO danh_muc (ten_danh_muc, slug, danh_muc_cha_id, thu_tu_hien_thi, trang_thai)
SELECT 'Laptop chính hãng', 'laptop-chinh-hang', dm.id, 1, 'HIEN_THI'
FROM danh_muc dm WHERE dm.slug = 'laptop';

-- 2) Phân loại "Laptop A" trong "Laptop chính hãng".
INSERT INTO phan_loai_san_pham (ten_phan_loai, danh_muc_id, slug, thu_tu_hien_thi, trang_thai)
SELECT 'Laptop A', dm.id, 'pl-laptop-a', 1, 'HIEN_THI'
FROM danh_muc dm WHERE dm.slug = 'laptop-chinh-hang';

-- 3) Thuộc tính cho "Laptop A".
INSERT INTO thuoc_tinh (ten_thuoc_tinh, phan_loai_id, ma_thuoc_tinh, kieu_du_lieu, thu_tu_hien_thi, trang_thai_duyet, trang_thai)
SELECT v.ten, pl.id, v.ma, 'STRING', v.thu_tu, 'APPROVED', 'ACTIVE'
FROM phan_loai_san_pham pl
JOIN (VALUES
    ('CPU',                  'cpu',                  1),
    ('RAM',                  'ram',                  2),
    ('Ổ cứng',               'o_cung',               3),
    ('Card đồ họa',          'card_do_hoa',          4),
    ('Kích thước màn hình',  'kich_thuoc_man_hinh',  5),
    ('Hệ điều hành',         'he_dieu_hanh',         6)
) AS v(ten, ma, thu_tu) ON pl.slug = 'pl-laptop-a';

-- 4) Giá trị cho từng thuộc tính.
INSERT INTO gia_tri_thuoc_tinh (thuoc_tinh_id, gia_tri, thu_tu_hien_thi, trang_thai_duyet, trang_thai)
SELECT tt.id, v.gia_tri, v.thu_tu, 'APPROVED', 'ACTIVE'
FROM thuoc_tinh tt
JOIN phan_loai_san_pham pl ON tt.phan_loai_id = pl.id
JOIN (VALUES
    ('cpu', 'Intel Core i3', 1),
    ('cpu', 'Intel Core i5', 2),
    ('cpu', 'Intel Core i7', 3),
    ('cpu', 'Intel Core i9', 4),
    ('cpu', 'AMD Ryzen 5',   5),
    ('cpu', 'AMD Ryzen 7',   6),
    ('ram', '8GB',  1),
    ('ram', '16GB', 2),
    ('ram', '32GB', 3),
    ('ram', '64GB', 4),
    ('o_cung', '256GB SSD', 1),
    ('o_cung', '512GB SSD', 2),
    ('o_cung', '1TB SSD',   3),
    ('o_cung', '2TB SSD',   4),
    ('card_do_hoa', 'Intel Iris Xe',     1),
    ('card_do_hoa', 'NVIDIA RTX 3050',   2),
    ('card_do_hoa', 'NVIDIA RTX 4050',   3),
    ('card_do_hoa', 'NVIDIA RTX 4060',   4),
    ('card_do_hoa', 'AMD Radeon Graphics', 5),
    ('kich_thuoc_man_hinh', '13.3 inch', 1),
    ('kich_thuoc_man_hinh', '14 inch',   2),
    ('kich_thuoc_man_hinh', '15.6 inch', 3),
    ('kich_thuoc_man_hinh', '16 inch',   4),
    ('kich_thuoc_man_hinh', '17.3 inch', 5),
    ('he_dieu_hanh', 'Windows 11',     1),
    ('he_dieu_hanh', 'Windows 11 Pro', 2),
    ('he_dieu_hanh', 'Free DOS',       3),
    ('he_dieu_hanh', 'macOS',          4)
) AS v(ma, gia_tri, thu_tu) ON pl.slug = 'pl-laptop-a' AND tt.ma_thuoc_tinh = v.ma;

-- 5) Dựng thong_so_loc cho "Laptop A" (khớp rebuildThongSoLoc).
INSERT INTO chi_tiet_thuoc_tinh_loc (phan_loai_id, thong_so_loc, ngay_tao, ngay_cap_nhat)
SELECT pl.id,
       COALESCE(
         jsonb_object_agg(x.ma, jsonb_build_object('label', x.label, 'values', x.vals))
           FILTER (WHERE x.ma IS NOT NULL),
         '{}'::jsonb),
       now(), now()
FROM phan_loai_san_pham pl
LEFT JOIN LATERAL (
    SELECT tt.ma_thuoc_tinh AS ma,
           tt.ten_thuoc_tinh AS label,
           COALESCE((
             SELECT jsonb_agg(gt.gia_tri ORDER BY gt.thu_tu_hien_thi, gt.id)
             FROM gia_tri_thuoc_tinh gt
             WHERE gt.thuoc_tinh_id = tt.id AND gt.trang_thai = 'ACTIVE'
           ), '[]'::jsonb) AS vals
    FROM thuoc_tinh tt
    WHERE tt.phan_loai_id = pl.id
      AND tt.trang_thai = 'ACTIVE'
      AND tt.ma_thuoc_tinh IS NOT NULL
) x ON true
WHERE pl.slug = 'pl-laptop-a'
GROUP BY pl.id
ON CONFLICT (phan_loai_id)
DO UPDATE SET thong_so_loc = EXCLUDED.thong_so_loc, ngay_cap_nhat = now();
