-- ============================================================
-- V12: Thêm thuộc tính + giá trị cho phân loại "PC Gaming"
--      (phân loại nằm trong danh mục slug 'pc-gaming', nay hiển thị tên "PC").
--      Thuộc tính: CPU, Mainboard, VGA, RAM, Nguồn máy tính (PSU).
-- ============================================================

-- ── 5 thuộc tính ───────────────────────────────────────────
INSERT INTO thuoc_tinh (ten_thuoc_tinh, phan_loai_id, ma_thuoc_tinh, kieu_du_lieu, thu_tu_hien_thi, trang_thai_duyet, trang_thai)
SELECT v.ten, pl.id, v.ma, 'STRING', v.thu_tu, 'APPROVED', 'ACTIVE'
FROM phan_loai_san_pham pl
JOIN danh_muc dm ON pl.danh_muc_id = dm.id
CROSS JOIN (VALUES
    ('CPU',                  'cpu',       1),
    ('Mainboard',            'mainboard', 2),
    ('VGA',                  'vga',       3),
    ('RAM',                  'ram',       4),
    ('Nguồn máy tính (PSU)', 'psu',       5)
) AS v(ten, ma, thu_tu)
WHERE dm.slug = 'pc-gaming';

-- ── Giá trị cho từng thuộc tính (≥4 mỗi thuộc tính) ────────
-- Khớp giá trị với thuộc tính vừa thêm theo (phân loại pc-gaming + tên thuộc tính).
INSERT INTO gia_tri_thuoc_tinh (thuoc_tinh_id, gia_tri, thu_tu_hien_thi, trang_thai_duyet, trang_thai)
SELECT tt.id, v.gia_tri, v.thu_tu, 'APPROVED', 'ACTIVE'
FROM thuoc_tinh tt
JOIN phan_loai_san_pham pl ON tt.phan_loai_id = pl.id
JOIN danh_muc dm ON pl.danh_muc_id = dm.id
CROSS JOIN (VALUES
    -- CPU
    ('CPU', 'Intel Core i5',        1),
    ('CPU', 'Intel Core i7',        2),
    ('CPU', 'Intel Core i9',        3),
    ('CPU', 'AMD Ryzen 5',          4),
    ('CPU', 'AMD Ryzen 7',          5),
    ('CPU', 'AMD Ryzen 9',          6),
    -- Mainboard
    ('Mainboard', 'ASUS B760',      1),
    ('Mainboard', 'MSI B650',       2),
    ('Mainboard', 'Gigabyte Z790',  3),
    ('Mainboard', 'ASRock X670E',   4),
    -- VGA
    ('VGA', 'NVIDIA RTX 4060',      1),
    ('VGA', 'NVIDIA RTX 4070',      2),
    ('VGA', 'NVIDIA RTX 4080',      3),
    ('VGA', 'AMD Radeon RX 7600',   4),
    ('VGA', 'AMD Radeon RX 7800 XT',5),
    -- RAM
    ('RAM', '8GB',                  1),
    ('RAM', '16GB',                 2),
    ('RAM', '32GB',                 3),
    ('RAM', '64GB',                 4),
    -- Nguồn máy tính (PSU)
    ('Nguồn máy tính (PSU)', '550W',  1),
    ('Nguồn máy tính (PSU)', '650W',  2),
    ('Nguồn máy tính (PSU)', '750W',  3),
    ('Nguồn máy tính (PSU)', '850W',  4),
    ('Nguồn máy tính (PSU)', '1000W', 5)
) AS v(ten_thuoc_tinh, gia_tri, thu_tu)
WHERE dm.slug = 'pc-gaming' AND tt.ten_thuoc_tinh = v.ten_thuoc_tinh;
