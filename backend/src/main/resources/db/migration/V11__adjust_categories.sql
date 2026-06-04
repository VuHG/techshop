-- ============================================================
-- V11: Tinh chỉnh danh mục
--   1) Đổi tên "PC Gaming" -> "PC" (GIỮ slug 'pc-gaming' để không phá link FE)
--   2) Xóa danh mục "Màn hình" + sản phẩm/biến thể liên quan (giữ snapshot đơn hàng)
--   3) Thêm phân loại cho "Linh kiện"
--   4) Thêm phân loại cho "Phụ kiện"
-- ============================================================

-- ── 1) Đổi tên PC Gaming -> PC ─────────────────────────────
UPDATE danh_muc
SET ten_danh_muc = 'PC', ngay_cap_nhat = now()
WHERE slug = 'pc-gaming';

-- ── 2) Xóa danh mục "Màn hình" (slug 'man-hinh') ───────────
-- Gỡ liên kết biến thể ở chi tiết đơn (giữ snapshot tên/giá/ảnh).
UPDATE chi_tiet_don_hang SET bien_the_id = NULL
WHERE bien_the_id IN (
    SELECT bt.id FROM bien_the_san_pham bt
    JOIN san_pham sp ON bt.san_pham_id = sp.id
    JOIN phan_loai_san_pham pl ON sp.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'man-hinh'
);

DELETE FROM gio_hang WHERE bien_the_id IN (
    SELECT bt.id FROM bien_the_san_pham bt
    JOIN san_pham sp ON bt.san_pham_id = sp.id
    JOIN phan_loai_san_pham pl ON sp.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'man-hinh'
);

DELETE FROM danh_gia WHERE san_pham_id IN (
    SELECT sp.id FROM san_pham sp
    JOIN phan_loai_san_pham pl ON sp.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'man-hinh'
);

DELETE FROM chi_tiet_phieu_nhap WHERE bien_the_id IN (
    SELECT bt.id FROM bien_the_san_pham bt
    JOIN san_pham sp ON bt.san_pham_id = sp.id
    JOIN phan_loai_san_pham pl ON sp.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'man-hinh'
);

DELETE FROM ma_giam_gia_san_pham WHERE san_pham_id IN (
    SELECT sp.id FROM san_pham sp
    JOIN phan_loai_san_pham pl ON sp.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'man-hinh'
);

-- Xóa biến thể (cascade: bien_the_nhan, bien_the_gia_tri_thuoc_tinh, anh_san_pham, flashsale).
DELETE FROM bien_the_san_pham WHERE san_pham_id IN (
    SELECT sp.id FROM san_pham sp
    JOIN phan_loai_san_pham pl ON sp.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'man-hinh'
);

-- Xóa sản phẩm.
DELETE FROM san_pham WHERE phan_loai_id IN (
    SELECT pl.id FROM phan_loai_san_pham pl
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'man-hinh'
);

-- Xóa filter schema + thuộc tính + giá trị thuộc tính của phân loại đó.
DELETE FROM chi_tiet_thuoc_tinh_loc WHERE phan_loai_id IN (
    SELECT pl.id FROM phan_loai_san_pham pl
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'man-hinh'
);

DELETE FROM gia_tri_thuoc_tinh WHERE thuoc_tinh_id IN (
    SELECT t.id FROM thuoc_tinh t
    JOIN phan_loai_san_pham pl ON t.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'man-hinh'
);

DELETE FROM thuoc_tinh WHERE phan_loai_id IN (
    SELECT pl.id FROM phan_loai_san_pham pl
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'man-hinh'
);

-- Xóa phân loại rồi danh mục.
DELETE FROM phan_loai_san_pham WHERE danh_muc_id IN (
    SELECT id FROM danh_muc WHERE slug = 'man-hinh'
);

DELETE FROM danh_muc WHERE slug = 'man-hinh';

-- ── 3) Thêm phân loại cho "Linh kiện" ──────────────────────
INSERT INTO phan_loai_san_pham (ten_phan_loai, danh_muc_id, slug, thu_tu_hien_thi, trang_thai)
SELECT v.ten, dm.id, v.slug, v.thu_tu, 'HIEN_THI'
FROM danh_muc dm
CROSS JOIN (VALUES
    ('Ram',             'pl-ram',            1),
    ('Ổ cứng SSD',      'pl-o-cung-ssd',     2),
    ('Ổ cứng HHD',      'pl-o-cung-hhd',     3),
    ('Sạc pin laptop',  'pl-sac-pin-laptop', 4),
    ('Màn hình rời',    'pl-man-hinh-roi',   5)
) AS v(ten, slug, thu_tu)
WHERE dm.slug = 'linh-kien';

-- ── 4) Thêm phân loại cho "Phụ kiện" ───────────────────────
INSERT INTO phan_loai_san_pham (ten_phan_loai, danh_muc_id, slug, thu_tu_hien_thi, trang_thai)
SELECT v.ten, dm.id, v.slug, v.thu_tu, 'HIEN_THI'
FROM danh_muc dm
CROSS JOIN (VALUES
    ('Chuột',                       'pl-chuot',                     1),
    ('Bàn phím',                    'pl-ban-phim',                  2),
    ('Lót chuột',                   'pl-lot-chuot',                 3),
    ('Tai nghe',                    'pl-tai-nghe',                  4),
    ('Loa',                         'pl-loa',                       5),
    ('Webcam rời',                  'pl-webcam-roi',                6),
    ('Hub USB',                     'pl-hub-usb',                   7),
    ('Bộ thu phát Wifi/Bluetooh',   'pl-bo-thu-phat-wifi-bluetooth',8),
    ('USB Flash Drive',             'pl-usb-flash-drive',           9)
) AS v(ten, slug, thu_tu)
WHERE dm.slug = 'phu-kien';
