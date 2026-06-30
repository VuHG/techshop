-- ============================================================
-- V2: TINH CHỈNH SCHEMA (denormalize) + SEED CATALOG (gộp từ V14..V27 cũ)
--   Bản đồ biến thể/màu, denormalize tên/thương hiệu/nhãn/ảnh, snapshot đơn,
--   xác nhận hoàn kho, thẻ, seed thuộc tính + sản phẩm + biến thể + flash sale.
-- (Gộp file để gọn — nội dung & thứ tự thực thi giữ nguyên 100%.)
-- ============================================================


-- ┌──────────────── [V14__variant_map_and_color.sql] ────────────────

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

-- ┌──────────────── [V15__product_image_and_variant_reviews.sql] ────────────────

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

-- ┌──────────────── [V16__order_brand_snapshot.sql] ────────────────

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

-- ┌──────────────── [V17__variant_denormalize_name_brand.sql] ────────────────

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

-- ┌──────────────── [V18__variant_denormalize_labels.sql] ────────────────

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

-- ┌──────────────── [V19__variant_denormalize_main_image.sql] ────────────────

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

-- ┌──────────────── [V20__order_stock_return_confirm.sql] ────────────────

-- ============================================================
-- V20: Hủy đơn KHÔNG còn tự hoàn kho ngay. Quản trị viên phải xác nhận
--      "hàng đã trở lại kho" như một bước riêng → cột da_hoan_kho.
-- ============================================================

ALTER TABLE don_hang ADD COLUMN da_hoan_kho BOOLEAN NOT NULL DEFAULT false;

-- Đơn đã hủy trước đây đã được hoàn kho tự động (theo logic cũ) → đánh dấu true
-- để admin không hoàn lại lần nữa gây sai tồn.
UPDATE don_hang SET da_hoan_kho = true WHERE trang_thai = 'DA_HUY';

-- ┌──────────────── [V21__product_level_tags.sql] ────────────────

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

-- ┌──────────────── [V22__seed_attributes_components_accessories.sql] ────────────────

-- ============================================================
-- V22: Seed thuộc tính + giá trị cho các phân loại Linh kiện & Phụ kiện.
--   Phân loại định danh theo slug (duy nhất, đặt ở V11) để tránh nhầm tên trùng.
--   Sau khi seed → dựng lại thong_so_loc (filter schema) cho từng phân loại,
--   khớp đúng logic ChiTietThuocTinhLocRepository.rebuildThongSoLoc.
-- ============================================================

-- ── 1) Thuộc tính (mỗi dòng: slug phân loại, tên, mã, thứ tự) ──────────────
INSERT INTO thuoc_tinh (ten_thuoc_tinh, phan_loai_id, ma_thuoc_tinh, kieu_du_lieu, thu_tu_hien_thi, trang_thai_duyet, trang_thai)
SELECT v.ten, pl.id, v.ma, 'STRING', v.thu_tu, 'APPROVED', 'ACTIVE'
FROM phan_loai_san_pham pl
JOIN (VALUES
    -- Màn hình rời
    ('pl-man-hinh-roi', 'Kiểu màn hình',        'kieu_man_hinh',        1),
    ('pl-man-hinh-roi', 'Kích thước màn hình',  'kich_thuoc_man_hinh',  2),
    ('pl-man-hinh-roi', 'Độ phân giải',         'do_phan_giai',         3),
    ('pl-man-hinh-roi', 'Tần số quét',          'tan_so_quet',          4),
    ('pl-man-hinh-roi', 'Tấm nền (Panel)',      'tam_nen',              5),
    ('pl-man-hinh-roi', 'Thời gian phản hồi',   'thoi_gian_phan_hoi',   6),
    -- Ram
    ('pl-ram', 'Thế hệ RAM',                    'the_he_ram',           1),
    ('pl-ram', 'Dung lượng',                    'dung_luong',           2),
    ('pl-ram', 'Tốc độ Bus',                    'toc_do_bus',           3),
    ('pl-ram', 'Loại RAM (Laptop/PC)',          'loai_ram',             4),
    -- Sạc pin laptop
    ('pl-sac-pin-laptop', 'Loại chân cắm',      'loai_chan_cam',        1),
    ('pl-sac-pin-laptop', 'Công suất',          'cong_suat',            2),
    -- Ổ cứng SSD
    ('pl-o-cung-ssd', 'Chuẩn cắm',              'chuan_cam',            1),
    ('pl-o-cung-ssd', 'Giao thức truyền tải',   'giao_thuc_truyen_tai', 2),
    ('pl-o-cung-ssd', 'Băng thông',             'bang_thong',           3),
    ('pl-o-cung-ssd', 'Dung lượng',             'dung_luong',           4),
    -- Bàn phím
    ('pl-ban-phim', 'Kiểu kết nối',             'kieu_ket_noi',         1),
    ('pl-ban-phim', 'Loại switch',              'loai_switch',          2),
    ('pl-ban-phim', 'Layout',                   'layout',               3),
    ('pl-ban-phim', 'Đèn nền',                  'den_nen',              4),
    -- Bộ thu phát Wifi/Bluetooth
    ('pl-bo-thu-phat-wifi-bluetooth', 'Chuẩn kết nối', 'chuan_ket_noi', 1),
    ('pl-bo-thu-phat-wifi-bluetooth', 'Chuẩn Wifi',    'chuan_wifi',    2),
    ('pl-bo-thu-phat-wifi-bluetooth', 'Băng tần',      'bang_tan',      3),
    ('pl-bo-thu-phat-wifi-bluetooth', 'Cổng kết nối',  'cong_ket_noi',  4),
    -- Chuột
    ('pl-chuot', 'Kiểu kết nối',                'kieu_ket_noi',         1),
    ('pl-chuot', 'Độ phân giải (DPI)',          'dpi',                  2),
    ('pl-chuot', 'Số nút',                      'so_nut',               3),
    ('pl-chuot', 'Cảm biến',                    'cam_bien',             4),
    -- Hub USB
    ('pl-hub-usb', 'Cổng kết nối',              'cong_ket_noi',         1),
    ('pl-hub-usb', 'Số cổng',                   'so_cong',              2),
    ('pl-hub-usb', 'Chuẩn USB',                 'chuan_usb',            3),
    ('pl-hub-usb', 'Cổng mở rộng',              'cong_mo_rong',         4),
    -- Loa
    ('pl-loa', 'Kiểu kết nối',                  'kieu_ket_noi',         1),
    ('pl-loa', 'Kiểu loa',                      'kieu_loa',             2),
    ('pl-loa', 'Công suất',                     'cong_suat',            3),
    ('pl-loa', 'Tính năng',                     'tinh_nang',            4),
    -- Lót chuột
    ('pl-lot-chuot', 'Kích thước',              'kich_thuoc',           1),
    ('pl-lot-chuot', 'Chất liệu bề mặt',        'chat_lieu_be_mat',     2),
    ('pl-lot-chuot', 'Độ dày',                  'do_day',               3),
    ('pl-lot-chuot', 'Đèn LED',                 'den_led',              4),
    -- Tai nghe
    ('pl-tai-nghe', 'Kiểu kết nối',             'kieu_ket_noi',         1),
    ('pl-tai-nghe', 'Kiểu dáng',                'kieu_dang',            2),
    ('pl-tai-nghe', 'Tính năng',                'tinh_nang',            3),
    ('pl-tai-nghe', 'Driver',                   'driver',               4),
    -- USB Flash Drive
    ('pl-usb-flash-drive', 'Dung lượng',        'dung_luong',           1),
    ('pl-usb-flash-drive', 'Chuẩn kết nối',     'chuan_ket_noi',        2),
    ('pl-usb-flash-drive', 'Tốc độ đọc',        'toc_do_doc',           3),
    ('pl-usb-flash-drive', 'Chất liệu vỏ',      'chat_lieu_vo',         4),
    -- Webcam rời
    ('pl-webcam-roi', 'Độ phân giải',           'do_phan_giai',         1),
    ('pl-webcam-roi', 'Tần số khung hình',      'tan_so_khung_hinh',    2),
    ('pl-webcam-roi', 'Góc nhìn',               'goc_nhin',             3),
    ('pl-webcam-roi', 'Tính năng',              'tinh_nang',            4)
) AS v(slug, ten, ma, thu_tu) ON pl.slug = v.slug;

-- ── 2) Giá trị thuộc tính (mỗi dòng: slug, mã thuộc tính, giá trị, thứ tự) ──
INSERT INTO gia_tri_thuoc_tinh (thuoc_tinh_id, gia_tri, thu_tu_hien_thi, trang_thai_duyet, trang_thai)
SELECT tt.id, v.gia_tri, v.thu_tu, 'APPROVED', 'ACTIVE'
FROM thuoc_tinh tt
JOIN phan_loai_san_pham pl ON tt.phan_loai_id = pl.id
JOIN (VALUES
    -- ===== Màn hình rời =====
    ('pl-man-hinh-roi', 'kieu_man_hinh', 'Phẳng', 1),
    ('pl-man-hinh-roi', 'kieu_man_hinh', 'Cong', 2),
    ('pl-man-hinh-roi', 'kich_thuoc_man_hinh', '22 inch', 1),
    ('pl-man-hinh-roi', 'kich_thuoc_man_hinh', '24 inch', 2),
    ('pl-man-hinh-roi', 'kich_thuoc_man_hinh', '27 inch', 3),
    ('pl-man-hinh-roi', 'kich_thuoc_man_hinh', '32 inch', 4),
    ('pl-man-hinh-roi', 'kich_thuoc_man_hinh', '34 inch', 5),
    ('pl-man-hinh-roi', 'do_phan_giai', 'Full HD (1920x1080)', 1),
    ('pl-man-hinh-roi', 'do_phan_giai', '2K (2560x1440)', 2),
    ('pl-man-hinh-roi', 'do_phan_giai', '4K (3840x2160)', 3),
    ('pl-man-hinh-roi', 'do_phan_giai', 'Ultrawide (3440x1440)', 4),
    ('pl-man-hinh-roi', 'tan_so_quet', '60Hz', 1),
    ('pl-man-hinh-roi', 'tan_so_quet', '75Hz', 2),
    ('pl-man-hinh-roi', 'tan_so_quet', '100Hz', 3),
    ('pl-man-hinh-roi', 'tan_so_quet', '144Hz', 4),
    ('pl-man-hinh-roi', 'tan_so_quet', '165Hz', 5),
    ('pl-man-hinh-roi', 'tan_so_quet', '240Hz', 6),
    ('pl-man-hinh-roi', 'tam_nen', 'IPS', 1),
    ('pl-man-hinh-roi', 'tam_nen', 'VA', 2),
    ('pl-man-hinh-roi', 'tam_nen', 'TN', 3),
    ('pl-man-hinh-roi', 'tam_nen', 'OLED', 4),
    ('pl-man-hinh-roi', 'thoi_gian_phan_hoi', '1ms', 1),
    ('pl-man-hinh-roi', 'thoi_gian_phan_hoi', '2ms', 2),
    ('pl-man-hinh-roi', 'thoi_gian_phan_hoi', '4ms', 3),
    ('pl-man-hinh-roi', 'thoi_gian_phan_hoi', '5ms', 4),
    -- ===== Ram =====
    ('pl-ram', 'the_he_ram', 'DDR3', 1),
    ('pl-ram', 'the_he_ram', 'DDR4', 2),
    ('pl-ram', 'the_he_ram', 'DDR5', 3),
    ('pl-ram', 'dung_luong', '4GB', 1),
    ('pl-ram', 'dung_luong', '8GB', 2),
    ('pl-ram', 'dung_luong', '16GB', 3),
    ('pl-ram', 'dung_luong', '32GB', 4),
    ('pl-ram', 'dung_luong', '64GB', 5),
    ('pl-ram', 'toc_do_bus', '1600MHz', 1),
    ('pl-ram', 'toc_do_bus', '2666MHz', 2),
    ('pl-ram', 'toc_do_bus', '3200MHz', 3),
    ('pl-ram', 'toc_do_bus', '3600MHz', 4),
    ('pl-ram', 'toc_do_bus', '5200MHz', 5),
    ('pl-ram', 'toc_do_bus', '6000MHz', 6),
    ('pl-ram', 'loai_ram', 'Laptop (SO-DIMM)', 1),
    ('pl-ram', 'loai_ram', 'PC (U-DIMM)', 2),
    -- ===== Sạc pin laptop =====
    ('pl-sac-pin-laptop', 'loai_chan_cam', 'USB-C', 1),
    ('pl-sac-pin-laptop', 'loai_chan_cam', 'DC tròn', 2),
    ('pl-sac-pin-laptop', 'loai_chan_cam', 'DC vuông', 3),
    ('pl-sac-pin-laptop', 'loai_chan_cam', 'MagSafe', 4),
    ('pl-sac-pin-laptop', 'cong_suat', '45W', 1),
    ('pl-sac-pin-laptop', 'cong_suat', '65W', 2),
    ('pl-sac-pin-laptop', 'cong_suat', '90W', 3),
    ('pl-sac-pin-laptop', 'cong_suat', '120W', 4),
    ('pl-sac-pin-laptop', 'cong_suat', '140W', 5),
    ('pl-sac-pin-laptop', 'cong_suat', '240W', 6),
    -- ===== Ổ cứng SSD =====
    ('pl-o-cung-ssd', 'chuan_cam', 'SATA III 2.5"', 1),
    ('pl-o-cung-ssd', 'chuan_cam', 'M.2 2280', 2),
    ('pl-o-cung-ssd', 'chuan_cam', 'M.2 2242', 3),
    ('pl-o-cung-ssd', 'chuan_cam', 'mSATA', 4),
    ('pl-o-cung-ssd', 'giao_thuc_truyen_tai', 'SATA', 1),
    ('pl-o-cung-ssd', 'giao_thuc_truyen_tai', 'NVMe PCIe 3.0', 2),
    ('pl-o-cung-ssd', 'giao_thuc_truyen_tai', 'NVMe PCIe 4.0', 3),
    ('pl-o-cung-ssd', 'giao_thuc_truyen_tai', 'NVMe PCIe 5.0', 4),
    ('pl-o-cung-ssd', 'bang_thong', '550 MB/s', 1),
    ('pl-o-cung-ssd', 'bang_thong', '2000 MB/s', 2),
    ('pl-o-cung-ssd', 'bang_thong', '3500 MB/s', 3),
    ('pl-o-cung-ssd', 'bang_thong', '7000 MB/s', 4),
    ('pl-o-cung-ssd', 'bang_thong', '12000 MB/s', 5),
    ('pl-o-cung-ssd', 'dung_luong', '256GB', 1),
    ('pl-o-cung-ssd', 'dung_luong', '512GB', 2),
    ('pl-o-cung-ssd', 'dung_luong', '1TB', 3),
    ('pl-o-cung-ssd', 'dung_luong', '2TB', 4),
    ('pl-o-cung-ssd', 'dung_luong', '4TB', 5),
    -- ===== Bàn phím =====
    ('pl-ban-phim', 'kieu_ket_noi', 'Có dây', 1),
    ('pl-ban-phim', 'kieu_ket_noi', 'Không dây (2.4GHz)', 2),
    ('pl-ban-phim', 'kieu_ket_noi', 'Bluetooth', 3),
    ('pl-ban-phim', 'loai_switch', 'Blue (Clicky)', 1),
    ('pl-ban-phim', 'loai_switch', 'Red (Linear)', 2),
    ('pl-ban-phim', 'loai_switch', 'Brown (Tactile)', 3),
    ('pl-ban-phim', 'loai_switch', 'Quang học (Optical)', 4),
    ('pl-ban-phim', 'layout', 'Fullsize (104 phím)', 1),
    ('pl-ban-phim', 'layout', 'TKL (87 phím)', 2),
    ('pl-ban-phim', 'layout', '75%', 3),
    ('pl-ban-phim', 'layout', '60%', 4),
    ('pl-ban-phim', 'den_nen', 'Không', 1),
    ('pl-ban-phim', 'den_nen', 'Đơn sắc', 2),
    ('pl-ban-phim', 'den_nen', 'RGB', 3),
    -- ===== Bộ thu phát Wifi/Bluetooth =====
    ('pl-bo-thu-phat-wifi-bluetooth', 'chuan_ket_noi', 'Wifi', 1),
    ('pl-bo-thu-phat-wifi-bluetooth', 'chuan_ket_noi', 'Bluetooth', 2),
    ('pl-bo-thu-phat-wifi-bluetooth', 'chuan_ket_noi', 'Wifi + Bluetooth', 3),
    ('pl-bo-thu-phat-wifi-bluetooth', 'chuan_wifi', 'Wifi 4 (N)', 1),
    ('pl-bo-thu-phat-wifi-bluetooth', 'chuan_wifi', 'Wifi 5 (AC)', 2),
    ('pl-bo-thu-phat-wifi-bluetooth', 'chuan_wifi', 'Wifi 6 (AX)', 3),
    ('pl-bo-thu-phat-wifi-bluetooth', 'chuan_wifi', 'Wifi 6E', 4),
    ('pl-bo-thu-phat-wifi-bluetooth', 'bang_tan', '2.4GHz', 1),
    ('pl-bo-thu-phat-wifi-bluetooth', 'bang_tan', '5GHz', 2),
    ('pl-bo-thu-phat-wifi-bluetooth', 'bang_tan', 'Dual-band', 3),
    ('pl-bo-thu-phat-wifi-bluetooth', 'cong_ket_noi', 'USB-A', 1),
    ('pl-bo-thu-phat-wifi-bluetooth', 'cong_ket_noi', 'USB-C', 2),
    ('pl-bo-thu-phat-wifi-bluetooth', 'cong_ket_noi', 'PCIe', 3),
    -- ===== Chuột =====
    ('pl-chuot', 'kieu_ket_noi', 'Có dây', 1),
    ('pl-chuot', 'kieu_ket_noi', 'Không dây (2.4GHz)', 2),
    ('pl-chuot', 'kieu_ket_noi', 'Bluetooth', 3),
    ('pl-chuot', 'dpi', '1600 DPI', 1),
    ('pl-chuot', 'dpi', '4000 DPI', 2),
    ('pl-chuot', 'dpi', '8000 DPI', 3),
    ('pl-chuot', 'dpi', '16000 DPI', 4),
    ('pl-chuot', 'dpi', '26000 DPI', 5),
    ('pl-chuot', 'so_nut', '2 nút', 1),
    ('pl-chuot', 'so_nut', '3 nút', 2),
    ('pl-chuot', 'so_nut', '6 nút', 3),
    ('pl-chuot', 'so_nut', '8+ nút', 4),
    ('pl-chuot', 'cam_bien', 'Quang học (Optical)', 1),
    ('pl-chuot', 'cam_bien', 'Laser', 2),
    -- ===== Hub USB =====
    ('pl-hub-usb', 'cong_ket_noi', 'USB-A', 1),
    ('pl-hub-usb', 'cong_ket_noi', 'USB-C', 2),
    ('pl-hub-usb', 'so_cong', '3 cổng', 1),
    ('pl-hub-usb', 'so_cong', '4 cổng', 2),
    ('pl-hub-usb', 'so_cong', '7 cổng', 3),
    ('pl-hub-usb', 'so_cong', '10+ cổng', 4),
    ('pl-hub-usb', 'chuan_usb', 'USB 2.0', 1),
    ('pl-hub-usb', 'chuan_usb', 'USB 3.0', 2),
    ('pl-hub-usb', 'chuan_usb', 'USB 3.1', 3),
    ('pl-hub-usb', 'chuan_usb', 'USB 3.2', 4),
    ('pl-hub-usb', 'cong_mo_rong', 'HDMI', 1),
    ('pl-hub-usb', 'cong_mo_rong', 'LAN (RJ45)', 2),
    ('pl-hub-usb', 'cong_mo_rong', 'Đọc thẻ SD', 3),
    ('pl-hub-usb', 'cong_mo_rong', 'Sạc PD', 4),
    -- ===== Loa =====
    ('pl-loa', 'kieu_ket_noi', 'Có dây (3.5mm)', 1),
    ('pl-loa', 'kieu_ket_noi', 'Bluetooth', 2),
    ('pl-loa', 'kieu_ket_noi', 'USB', 3),
    ('pl-loa', 'kieu_loa', 'Loa 2.0', 1),
    ('pl-loa', 'kieu_loa', 'Loa 2.1', 2),
    ('pl-loa', 'kieu_loa', 'Soundbar', 3),
    ('pl-loa', 'kieu_loa', 'Loa di động', 4),
    ('pl-loa', 'cong_suat', '6W', 1),
    ('pl-loa', 'cong_suat', '10W', 2),
    ('pl-loa', 'cong_suat', '20W', 3),
    ('pl-loa', 'cong_suat', '40W', 4),
    ('pl-loa', 'cong_suat', '60W+', 5),
    ('pl-loa', 'tinh_nang', 'Chống nước', 1),
    ('pl-loa', 'tinh_nang', 'Đèn RGB', 2),
    ('pl-loa', 'tinh_nang', 'Tích hợp mic', 3),
    ('pl-loa', 'tinh_nang', 'Pin sạc', 4),
    -- ===== Lót chuột =====
    ('pl-lot-chuot', 'kich_thuoc', 'Nhỏ (S)', 1),
    ('pl-lot-chuot', 'kich_thuoc', 'Vừa (M)', 2),
    ('pl-lot-chuot', 'kich_thuoc', 'Lớn (L)', 3),
    ('pl-lot-chuot', 'kich_thuoc', 'Extended (XL)', 4),
    ('pl-lot-chuot', 'chat_lieu_be_mat', 'Vải', 1),
    ('pl-lot-chuot', 'chat_lieu_be_mat', 'Cao su', 2),
    ('pl-lot-chuot', 'chat_lieu_be_mat', 'Nhựa cứng', 3),
    ('pl-lot-chuot', 'chat_lieu_be_mat', 'Kính cường lực', 4),
    ('pl-lot-chuot', 'do_day', '2mm', 1),
    ('pl-lot-chuot', 'do_day', '3mm', 2),
    ('pl-lot-chuot', 'do_day', '4mm', 3),
    ('pl-lot-chuot', 'do_day', '5mm', 4),
    ('pl-lot-chuot', 'den_led', 'Không', 1),
    ('pl-lot-chuot', 'den_led', 'RGB viền', 2),
    -- ===== Tai nghe =====
    ('pl-tai-nghe', 'kieu_ket_noi', 'Có dây (3.5mm)', 1),
    ('pl-tai-nghe', 'kieu_ket_noi', 'Có dây (USB)', 2),
    ('pl-tai-nghe', 'kieu_ket_noi', 'Bluetooth', 3),
    ('pl-tai-nghe', 'kieu_ket_noi', 'Không dây (2.4GHz)', 4),
    ('pl-tai-nghe', 'kieu_dang', 'In-ear', 1),
    ('pl-tai-nghe', 'kieu_dang', 'On-ear', 2),
    ('pl-tai-nghe', 'kieu_dang', 'Over-ear', 3),
    ('pl-tai-nghe', 'kieu_dang', 'True Wireless (TWS)', 4),
    ('pl-tai-nghe', 'tinh_nang', 'Chống ồn chủ động (ANC)', 1),
    ('pl-tai-nghe', 'tinh_nang', 'Có mic', 2),
    ('pl-tai-nghe', 'tinh_nang', 'Chống nước', 3),
    ('pl-tai-nghe', 'tinh_nang', 'Đèn RGB', 4),
    ('pl-tai-nghe', 'driver', '10mm', 1),
    ('pl-tai-nghe', 'driver', '40mm', 2),
    ('pl-tai-nghe', 'driver', '50mm', 3),
    -- ===== USB Flash Drive =====
    ('pl-usb-flash-drive', 'dung_luong', '16GB', 1),
    ('pl-usb-flash-drive', 'dung_luong', '32GB', 2),
    ('pl-usb-flash-drive', 'dung_luong', '64GB', 3),
    ('pl-usb-flash-drive', 'dung_luong', '128GB', 4),
    ('pl-usb-flash-drive', 'dung_luong', '256GB', 5),
    ('pl-usb-flash-drive', 'dung_luong', '512GB', 6),
    ('pl-usb-flash-drive', 'chuan_ket_noi', 'USB 2.0', 1),
    ('pl-usb-flash-drive', 'chuan_ket_noi', 'USB 3.0', 2),
    ('pl-usb-flash-drive', 'chuan_ket_noi', 'USB 3.1', 3),
    ('pl-usb-flash-drive', 'chuan_ket_noi', 'USB-C', 4),
    ('pl-usb-flash-drive', 'toc_do_doc', '100 MB/s', 1),
    ('pl-usb-flash-drive', 'toc_do_doc', '150 MB/s', 2),
    ('pl-usb-flash-drive', 'toc_do_doc', '200 MB/s', 3),
    ('pl-usb-flash-drive', 'toc_do_doc', '400 MB/s', 4),
    ('pl-usb-flash-drive', 'chat_lieu_vo', 'Nhựa', 1),
    ('pl-usb-flash-drive', 'chat_lieu_vo', 'Kim loại', 2),
    -- ===== Webcam rời =====
    ('pl-webcam-roi', 'do_phan_giai', 'HD 720p', 1),
    ('pl-webcam-roi', 'do_phan_giai', 'Full HD 1080p', 2),
    ('pl-webcam-roi', 'do_phan_giai', '2K QHD', 3),
    ('pl-webcam-roi', 'do_phan_giai', '4K UHD', 4),
    ('pl-webcam-roi', 'tan_so_khung_hinh', '30 FPS', 1),
    ('pl-webcam-roi', 'tan_so_khung_hinh', '60 FPS', 2),
    ('pl-webcam-roi', 'goc_nhin', '65°', 1),
    ('pl-webcam-roi', 'goc_nhin', '78°', 2),
    ('pl-webcam-roi', 'goc_nhin', '90°', 3),
    ('pl-webcam-roi', 'goc_nhin', '120°', 4),
    ('pl-webcam-roi', 'tinh_nang', 'Tích hợp mic', 1),
    ('pl-webcam-roi', 'tinh_nang', 'Tự động lấy nét', 2),
    ('pl-webcam-roi', 'tinh_nang', 'Chỉnh sáng tự động', 3),
    ('pl-webcam-roi', 'tinh_nang', 'Có nắp che', 4)
) AS v(slug, ma, gia_tri, thu_tu) ON pl.slug = v.slug AND tt.ma_thuoc_tinh = v.ma;

-- ── 3) Dựng lại thong_so_loc cho 13 phân loại vừa seed ─────────────────────
--      (khớp ChiTietThuocTinhLocRepository.rebuildThongSoLoc, làm gộp một lượt).
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
WHERE pl.slug IN (
    'pl-man-hinh-roi', 'pl-ram', 'pl-sac-pin-laptop', 'pl-o-cung-ssd',
    'pl-ban-phim', 'pl-bo-thu-phat-wifi-bluetooth', 'pl-chuot', 'pl-hub-usb',
    'pl-loa', 'pl-lot-chuot', 'pl-tai-nghe', 'pl-usb-flash-drive', 'pl-webcam-roi'
)
GROUP BY pl.id
ON CONFLICT (phan_loai_id)
DO UPDATE SET thong_so_loc = EXCLUDED.thong_so_loc, ngay_cap_nhat = now();

-- ┌──────────────── [V23__seed_laptop_chinh_hang.sql] ────────────────

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

-- ┌──────────────── [V25__seed_laptop_products.sql] ────────────────

-- ============================================================
-- V25: Thêm sản phẩm cho phân loại "Laptop" và tạo + seed "Laptop văn phòng".
--   - "Laptop văn phòng": phân loại mới trong danh mục "Laptop" (cùng cấp "Laptop").
--   - Cả hai dùng bộ thuộc tính laptop (cpu, ram, o_cung, card_do_hoa,
--     kich_thuoc_man_hinh, he_dieu_hanh) để card hiển thị + lọc khớp.
--   - Mỗi phân loại seed 6 SP (1 biến thể = 1 card), guard COUNT >= 6 để không nhân đôi.
-- ============================================================

-- ── 1) Phân loại "Laptop văn phòng" trong danh mục 'laptop' ──────────────
INSERT INTO phan_loai_san_pham (ten_phan_loai, danh_muc_id, slug, thu_tu_hien_thi, trang_thai)
SELECT 'Laptop văn phòng', dm.id, 'pl-laptop-van-phong', 2, 'HIEN_THI'
FROM danh_muc dm
WHERE dm.slug = 'laptop'
  AND NOT EXISTS (SELECT 1 FROM phan_loai_san_pham WHERE slug = 'pl-laptop-van-phong');

-- ── 2) Thuộc tính + giá trị cho 2 phân loại (Laptop + Laptop văn phòng) ──
-- Chỉ thêm cho phân loại CHƯA có thuộc tính (tránh trùng với schema sẵn có).
INSERT INTO thuoc_tinh (ten_thuoc_tinh, phan_loai_id, ma_thuoc_tinh, kieu_du_lieu, thu_tu_hien_thi, trang_thai_duyet, trang_thai)
SELECT v.ten, pl.id, v.ma, 'STRING', v.thu_tu, 'APPROVED', 'ACTIVE'
FROM phan_loai_san_pham pl
JOIN danh_muc dm ON pl.danh_muc_id = dm.id
JOIN (VALUES
    ('CPU',                  'cpu',                  1),
    ('RAM',                  'ram',                  2),
    ('Ổ cứng',               'o_cung',               3),
    ('Card đồ họa',          'card_do_hoa',          4),
    ('Kích thước màn hình',  'kich_thuoc_man_hinh',  5),
    ('Hệ điều hành',         'he_dieu_hanh',         6)
) AS v(ten, ma, thu_tu) ON true
WHERE dm.slug = 'laptop'
  AND pl.ten_phan_loai IN ('Laptop', 'Laptop văn phòng')
  AND NOT EXISTS (SELECT 1 FROM thuoc_tinh t WHERE t.phan_loai_id = pl.id AND t.ma_thuoc_tinh = v.ma);

INSERT INTO gia_tri_thuoc_tinh (thuoc_tinh_id, gia_tri, thu_tu_hien_thi, trang_thai_duyet, trang_thai)
SELECT tt.id, v.gia_tri, v.thu_tu, 'APPROVED', 'ACTIVE'
FROM thuoc_tinh tt
JOIN phan_loai_san_pham pl ON tt.phan_loai_id = pl.id
JOIN danh_muc dm ON pl.danh_muc_id = dm.id
JOIN (VALUES
    ('cpu', 'Intel Core i3', 1), ('cpu', 'Intel Core i5', 2), ('cpu', 'Intel Core i7', 3),
    ('cpu', 'Intel Core i9', 4), ('cpu', 'AMD Ryzen 5', 5), ('cpu', 'AMD Ryzen 7', 6),
    ('ram', '8GB', 1), ('ram', '16GB', 2), ('ram', '32GB', 3), ('ram', '64GB', 4),
    ('o_cung', '256GB SSD', 1), ('o_cung', '512GB SSD', 2), ('o_cung', '1TB SSD', 3), ('o_cung', '2TB SSD', 4),
    ('card_do_hoa', 'Intel Iris Xe', 1), ('card_do_hoa', 'NVIDIA RTX 3050', 2), ('card_do_hoa', 'NVIDIA RTX 4050', 3),
    ('card_do_hoa', 'NVIDIA RTX 4060', 4), ('card_do_hoa', 'AMD Radeon Graphics', 5),
    ('kich_thuoc_man_hinh', '13.3 inch', 1), ('kich_thuoc_man_hinh', '14 inch', 2), ('kich_thuoc_man_hinh', '15.6 inch', 3),
    ('kich_thuoc_man_hinh', '16 inch', 4), ('kich_thuoc_man_hinh', '17.3 inch', 5),
    ('he_dieu_hanh', 'Windows 11', 1), ('he_dieu_hanh', 'Windows 11 Pro', 2), ('he_dieu_hanh', 'Free DOS', 3), ('he_dieu_hanh', 'macOS', 4)
) AS v(ma, gia_tri, thu_tu) ON tt.ma_thuoc_tinh = v.ma
WHERE dm.slug = 'laptop'
  AND pl.ten_phan_loai IN ('Laptop', 'Laptop văn phòng')
  AND NOT EXISTS (SELECT 1 FROM gia_tri_thuoc_tinh g WHERE g.thuoc_tinh_id = tt.id AND g.gia_tri = v.gia_tri);

-- Dựng lại thong_so_loc cho 2 phân loại (khớp rebuildThongSoLoc).
INSERT INTO chi_tiet_thuoc_tinh_loc (phan_loai_id, thong_so_loc, ngay_tao, ngay_cap_nhat)
SELECT pl.id,
       COALESCE(
         jsonb_object_agg(x.ma, jsonb_build_object('label', x.label, 'values', x.vals))
           FILTER (WHERE x.ma IS NOT NULL),
         '{}'::jsonb),
       now(), now()
FROM phan_loai_san_pham pl
JOIN danh_muc dm ON pl.danh_muc_id = dm.id
LEFT JOIN LATERAL (
    SELECT tt.ma_thuoc_tinh AS ma, tt.ten_thuoc_tinh AS label,
           COALESCE((SELECT jsonb_agg(gt.gia_tri ORDER BY gt.thu_tu_hien_thi, gt.id)
                     FROM gia_tri_thuoc_tinh gt
                     WHERE gt.thuoc_tinh_id = tt.id AND gt.trang_thai = 'ACTIVE'), '[]'::jsonb) AS vals
    FROM thuoc_tinh tt
    WHERE tt.phan_loai_id = pl.id AND tt.trang_thai = 'ACTIVE' AND tt.ma_thuoc_tinh IS NOT NULL
) x ON true
WHERE dm.slug = 'laptop' AND pl.ten_phan_loai IN ('Laptop', 'Laptop văn phòng')
GROUP BY pl.id
ON CONFLICT (phan_loai_id)
DO UPDATE SET thong_so_loc = EXCLUDED.thong_so_loc, ngay_cap_nhat = now();

-- ┌──────────────── [V27__more_attributes_laptop_van_phong.sql] ────────────────

-- ============================================================
-- V27: Bổ sung thuộc tính (tiêu chí lọc) + giá trị cho phân loại "Laptop văn phòng".
--   Thêm 6 tiêu chí đặc thù: trọng lượng, dung lượng pin, tần số quét,
--   độ phân giải, cổng kết nối, chất liệu vỏ (thu_tu 7..12, sau 6 tiêu chí ở V25).
--   Sau đó dựng lại thong_so_loc (filter schema) → lọc theo tiêu chí hiển thị thêm.
--   Admin "Thêm/Sửa biến thể" của Laptop văn phòng cũng tự có các dropdown này.
-- ============================================================

-- ── 1) Thuộc tính mới (chỉ thêm cái CHƯA có) ────────────────
INSERT INTO thuoc_tinh (ten_thuoc_tinh, phan_loai_id, ma_thuoc_tinh, kieu_du_lieu, thu_tu_hien_thi, trang_thai_duyet, trang_thai)
SELECT v.ten, pl.id, v.ma, 'STRING', v.thu_tu, 'APPROVED', 'ACTIVE'
FROM phan_loai_san_pham pl
JOIN (VALUES
    ('Trọng lượng',         'trong_luong',    7),
    ('Dung lượng pin',      'dung_luong_pin', 8),
    ('Tần số quét',         'tan_so_quet',    9),
    ('Độ phân giải',        'do_phan_giai',  10),
    ('Cổng kết nối',        'cong_ket_noi',  11),
    ('Chất liệu vỏ',        'chat_lieu_vo',  12)
) AS v(ten, ma, thu_tu) ON pl.slug = 'pl-laptop-van-phong'
WHERE NOT EXISTS (
    SELECT 1 FROM thuoc_tinh t WHERE t.phan_loai_id = pl.id AND t.ma_thuoc_tinh = v.ma
);

-- ── 2) Giá trị cho từng thuộc tính ──────────────────────────
INSERT INTO gia_tri_thuoc_tinh (thuoc_tinh_id, gia_tri, thu_tu_hien_thi, trang_thai_duyet, trang_thai)
SELECT tt.id, v.gia_tri, v.thu_tu, 'APPROVED', 'ACTIVE'
FROM thuoc_tinh tt
JOIN phan_loai_san_pham pl ON tt.phan_loai_id = pl.id
JOIN (VALUES
    ('trong_luong', 'Dưới 1.3 kg',  1),
    ('trong_luong', '1.3 - 1.5 kg', 2),
    ('trong_luong', '1.5 - 1.8 kg', 3),
    ('trong_luong', 'Trên 1.8 kg',  4),
    ('dung_luong_pin', '42Wh', 1),
    ('dung_luong_pin', '50Wh', 2),
    ('dung_luong_pin', '56Wh', 3),
    ('dung_luong_pin', '60Wh', 4),
    ('dung_luong_pin', '70Wh', 5),
    ('tan_so_quet', '60Hz',  1),
    ('tan_so_quet', '90Hz',  2),
    ('tan_so_quet', '120Hz', 3),
    ('do_phan_giai', 'HD (1366x768)',       1),
    ('do_phan_giai', 'Full HD (1920x1080)', 2),
    ('do_phan_giai', '2K (2560x1440)',      3),
    ('do_phan_giai', '2.8K OLED (2880x1800)', 4),
    ('cong_ket_noi', 'USB-C',          1),
    ('cong_ket_noi', 'USB-A',          2),
    ('cong_ket_noi', 'HDMI',           3),
    ('cong_ket_noi', 'Thunderbolt 4',  4),
    ('cong_ket_noi', 'Đầu đọc thẻ SD', 5),
    ('chat_lieu_vo', 'Nhựa',          1),
    ('chat_lieu_vo', 'Nhôm',          2),
    ('chat_lieu_vo', 'Hợp kim nhôm',  3),
    ('chat_lieu_vo', 'Sợi carbon',    4)
) AS v(ma, gia_tri, thu_tu) ON tt.ma_thuoc_tinh = v.ma
WHERE pl.slug = 'pl-laptop-van-phong'
  AND NOT EXISTS (
      SELECT 1 FROM gia_tri_thuoc_tinh g WHERE g.thuoc_tinh_id = tt.id AND g.gia_tri = v.gia_tri
  );

-- ── 3) Dựng lại thong_so_loc cho "Laptop văn phòng" (khớp rebuildThongSoLoc) ──
INSERT INTO chi_tiet_thuoc_tinh_loc (phan_loai_id, thong_so_loc, ngay_tao, ngay_cap_nhat)
SELECT pl.id,
       COALESCE(
         jsonb_object_agg(x.ma, jsonb_build_object('label', x.label, 'values', x.vals))
           FILTER (WHERE x.ma IS NOT NULL),
         '{}'::jsonb),
       now(), now()
FROM phan_loai_san_pham pl
LEFT JOIN LATERAL (
    SELECT tt.ma_thuoc_tinh AS ma, tt.ten_thuoc_tinh AS label,
           COALESCE((SELECT jsonb_agg(gt.gia_tri ORDER BY gt.thu_tu_hien_thi, gt.id)
                     FROM gia_tri_thuoc_tinh gt
                     WHERE gt.thuoc_tinh_id = tt.id AND gt.trang_thai = 'ACTIVE'), '[]'::jsonb) AS vals
    FROM thuoc_tinh tt
    WHERE tt.phan_loai_id = pl.id AND tt.trang_thai = 'ACTIVE' AND tt.ma_thuoc_tinh IS NOT NULL
) x ON true
WHERE pl.slug = 'pl-laptop-van-phong'
GROUP BY pl.id
ON CONFLICT (phan_loai_id)
DO UPDATE SET thong_so_loc = EXCLUDED.thong_so_loc, ngay_cap_nhat = now();
