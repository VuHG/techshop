-- ============================================================
-- V5: Seed Data
-- Dữ liệu khởi tạo: vai trò, danh mục, phân loại, thuộc tính,
--                   nhãn, 1 sản phẩm mẫu với 2 biến thể
-- ============================================================

-- ============================================================
-- 1. Vai trò
-- ============================================================

INSERT INTO vai_tro (ten_vai_tro) VALUES
    ('CUSTOMER'),
    ('ADMIN');

-- ============================================================
-- 2. Danh mục (cấp 1: cha | cấp 2: con)
-- ============================================================

INSERT INTO danh_muc (ten_danh_muc, slug, danh_muc_cha_id, thu_tu_hien_thi) VALUES
    ('Laptop',          'laptop',       NULL, 1),
    ('PC Gaming',       'pc-gaming',    NULL, 2),
    ('Màn hình',        'man-hinh',     NULL, 3),
    ('Linh kiện',       'linh-kien',    NULL, 4),
    ('Phụ kiện',        'phu-kien',     NULL, 5);

-- Danh mục con của Linh kiện (id=4)
INSERT INTO danh_muc (ten_danh_muc, slug, danh_muc_cha_id, thu_tu_hien_thi) VALUES
    ('RAM',     'ram',  4, 1),
    ('SSD',     'ssd',  4, 2),
    ('Card đồ họa', 'card-do-hoa', 4, 3),
    ('CPU',     'cpu',  4, 4);

-- Danh mục con của Phụ kiện (id=5)
INSERT INTO danh_muc (ten_danh_muc, slug, danh_muc_cha_id, thu_tu_hien_thi) VALUES
    ('Chuột',       'chuot',        5, 1),
    ('Bàn phím',    'ban-phim',     5, 2),
    ('Tai nghe',    'tai-nghe',     5, 3);

-- ============================================================
-- 3. Phân loại sản phẩm
-- ============================================================

INSERT INTO phan_loai_san_pham (ten_phan_loai, danh_muc_id) VALUES
    ('Laptop',      1),   -- id=1
    ('PC Gaming',   2),   -- id=2
    ('Màn hình',    3),   -- id=3
    ('RAM',         6),   -- id=4  (danh_muc slug='ram')
    ('SSD',         7),   -- id=5  (danh_muc slug='ssd')
    ('Card đồ họa', 8),   -- id=6
    ('CPU',         9),   -- id=7
    ('Chuột',       10),  -- id=8
    ('Bàn phím',    11);  -- id=9

-- ============================================================
-- 4. Thuộc tính cho phân loại Laptop (id=1)
-- ============================================================

INSERT INTO thuoc_tinh (ten_thuoc_tinh, phan_loai_id) VALUES
    ('RAM',             1),   -- id=1
    ('CPU',             1),   -- id=2
    ('Card đồ họa',     1),   -- id=3
    ('Màu sắc',         1),   -- id=4
    ('Dung lượng SSD',  1),   -- id=5
    ('Kích thước màn',  1);   -- id=6

-- Giá trị cho RAM (thuoc_tinh id=1)
INSERT INTO gia_tri_thuoc_tinh (thuoc_tinh_id, gia_tri) VALUES
    (1, '8GB'),
    (1, '16GB'),
    (1, '32GB'),
    (1, '64GB');

-- Giá trị cho CPU (thuoc_tinh id=2)
INSERT INTO gia_tri_thuoc_tinh (thuoc_tinh_id, gia_tri) VALUES
    (2, 'Intel Core i5'),
    (2, 'Intel Core i7'),
    (2, 'Intel Core i9'),
    (2, 'AMD Ryzen 5'),
    (2, 'AMD Ryzen 7'),
    (2, 'AMD Ryzen 9');

-- Giá trị cho Card đồ họa (thuoc_tinh id=3)
INSERT INTO gia_tri_thuoc_tinh (thuoc_tinh_id, gia_tri) VALUES
    (3, 'Intel UHD Graphics'),
    (3, 'NVIDIA RTX 3050'),
    (3, 'NVIDIA RTX 3060'),
    (3, 'NVIDIA RTX 4060'),
    (3, 'NVIDIA RTX 4070');

-- Giá trị cho Màu sắc (thuoc_tinh id=4)
INSERT INTO gia_tri_thuoc_tinh (thuoc_tinh_id, gia_tri) VALUES
    (4, 'Đen'),
    (4, 'Bạc'),
    (4, 'Xanh'),
    (4, 'Trắng');

-- Giá trị cho Dung lượng SSD (thuoc_tinh id=5)
INSERT INTO gia_tri_thuoc_tinh (thuoc_tinh_id, gia_tri) VALUES
    (5, '256GB'),
    (5, '512GB'),
    (5, '1TB'),
    (5, '2TB');

-- Giá trị cho Kích thước màn (thuoc_tinh id=6)
INSERT INTO gia_tri_thuoc_tinh (thuoc_tinh_id, gia_tri) VALUES
    (6, '13.3 inch'),
    (6, '14 inch'),
    (6, '15.6 inch'),
    (6, '16 inch');

-- ============================================================
-- 5. Nhãn sản phẩm
-- ============================================================

INSERT INTO nhan_san_pham (ten_nhan, mau_sac) VALUES
    ('Hot',         '#FF4444'),
    ('Sale',        '#FF8800'),
    ('Mới về',      '#00AA44'),
    ('Trả góp 0%',  '#0066CC'),
    ('Bán chạy',    '#9900CC');

-- ============================================================
-- 6. Filter schema cho phân loại Laptop
-- ============================================================

INSERT INTO chi_tiet_thuoc_tinh_loc (phan_loai_id, thong_so_loc) VALUES
(1, '{
    "ram":      {"label": "RAM",            "values": ["8GB","16GB","32GB","64GB"]},
    "cpu":      {"label": "CPU",            "values": ["Intel Core i5","Intel Core i7","Intel Core i9","AMD Ryzen 5","AMD Ryzen 7"]},
    "gpu":      {"label": "Card đồ họa",    "values": ["Intel UHD Graphics","NVIDIA RTX 3050","NVIDIA RTX 3060","NVIDIA RTX 4060","NVIDIA RTX 4070"]},
    "storage":  {"label": "Ổ cứng",         "values": ["256GB","512GB","1TB","2TB"]},
    "screen":   {"label": "Màn hình",       "values": ["13.3 inch","14 inch","15.6 inch","16 inch"]},
    "color":    {"label": "Màu sắc",        "values": ["Đen","Bạc","Xanh","Trắng"]}
}');

-- ============================================================
-- 7. Sản phẩm mẫu: ASUS VivoBook 15 (2 biến thể)
-- ============================================================

INSERT INTO san_pham (
    ten_san_pham, slug, mo_ta_ngan, phan_loai_id, thuong_hieu,
    thong_so_ky_thuat, trang_thai
) VALUES (
    'ASUS VivoBook 15 X1502',
    'asus-vivobook-15-x1502',
    'Laptop văn phòng mỏng nhẹ, màn hình 15.6 inch Full HD, pin trâu 12 tiếng',
    1,
    'ASUS',
    '{
        "man_hinh":     "15.6 inch, Full HD (1920x1080), IPS, 60Hz",
        "pin":          "42Wh, sạc nhanh 65W, lên đến 12 giờ",
        "os":           "Windows 11 Home",
        "chuan_wifi":   "WiFi 6 (802.11ax)",
        "cong_ket_noi": "2x USB-A 3.2, 1x USB-C 3.2, 1x HDMI 1.4, 1x microSD"
    }',
    'CON_HANG'
);

-- Biến thể 1: i5 / 8GB / 512GB / Đen
INSERT INTO bien_the_san_pham (
    san_pham_id, ma_bien_the, thong_so_bien_the,
    gia, gia_khuyen_mai, so_luong_ton, trang_thai
) VALUES (
    1,
    'ASUS-X1502-I5-8GB-512-DEN',
    '{"ram":"8GB","cpu":"Intel Core i5","gpu":"Intel UHD Graphics","storage":"512GB","screen":"15.6 inch","color":"Đen"}',
    13990000, 12490000, 50, 'CON_HANG'
);

-- Biến thể 2: i7 / 16GB / 512GB / Bạc
INSERT INTO bien_the_san_pham (
    san_pham_id, ma_bien_the, thong_so_bien_the,
    gia, gia_khuyen_mai, so_luong_ton, trang_thai
) VALUES (
    1,
    'ASUS-X1502-I7-16GB-512-BAC',
    '{"ram":"16GB","cpu":"Intel Core i7","gpu":"Intel UHD Graphics","storage":"512GB","screen":"15.6 inch","color":"Bạc"}',
    18990000, 16990000, 30, 'CON_HANG'
);

-- Gắn nhãn cho biến thể 1 (Hot + Bán chạy)
INSERT INTO bien_the_nhan (bien_the_id, nhan_id) VALUES (1, 1), (1, 5);

-- Gắn nhãn cho biến thể 2 (Mới về)
INSERT INTO bien_the_nhan (bien_the_id, nhan_id) VALUES (2, 3);

-- Gắn giá trị thuộc tính cho biến thể 1
-- RAM=8GB(id=1), CPU=Intel i5(id=5), GPU=Intel UHD(id=11), Màu=Đen(id=15), SSD=512GB(id=19), Màn=15.6(id=27)
INSERT INTO bien_the_gia_tri_thuoc_tinh (bien_the_id, gia_tri_thuoc_tinh_id)
SELECT 1, id FROM gia_tri_thuoc_tinh
WHERE (thuoc_tinh_id = 1 AND gia_tri = '8GB')
   OR (thuoc_tinh_id = 2 AND gia_tri = 'Intel Core i5')
   OR (thuoc_tinh_id = 3 AND gia_tri = 'Intel UHD Graphics')
   OR (thuoc_tinh_id = 4 AND gia_tri = 'Đen')
   OR (thuoc_tinh_id = 5 AND gia_tri = '512GB')
   OR (thuoc_tinh_id = 6 AND gia_tri = '15.6 inch');

-- Gắn giá trị thuộc tính cho biến thể 2
INSERT INTO bien_the_gia_tri_thuoc_tinh (bien_the_id, gia_tri_thuoc_tinh_id)
SELECT 2, id FROM gia_tri_thuoc_tinh
WHERE (thuoc_tinh_id = 1 AND gia_tri = '16GB')
   OR (thuoc_tinh_id = 2 AND gia_tri = 'Intel Core i7')
   OR (thuoc_tinh_id = 3 AND gia_tri = 'Intel UHD Graphics')
   OR (thuoc_tinh_id = 4 AND gia_tri = 'Bạc')
   OR (thuoc_tinh_id = 5 AND gia_tri = '512GB')
   OR (thuoc_tinh_id = 6 AND gia_tri = '15.6 inch');

-- Ảnh placeholder (thay bằng URL thật khi có)
INSERT INTO anh_san_pham (san_pham_id, bien_the_id, url_anh, la_anh_chinh, thu_tu) VALUES
    (1, 1, 'https://placeholder.techshop.vn/asus-x1502-den-1.jpg',  true,  1),
    (1, 1, 'https://placeholder.techshop.vn/asus-x1502-den-2.jpg',  false, 2),
    (1, 2, 'https://placeholder.techshop.vn/asus-x1502-bac-1.jpg',  true,  1),
    (1, 2, 'https://placeholder.techshop.vn/asus-x1502-bac-2.jpg',  false, 2);

-- ============================================================
-- 8. Mã giảm giá mẫu
-- ============================================================

INSERT INTO ma_giam_gia (
    ma_code, ten_ma, loai_giam, gia_tri_giam, gia_tri_giam_toi_da,
    dieu_kien_toi_thieu, so_luong_toi_da, bat_dau, ket_thuc, trang_thai
) VALUES (
    'TECHSHOP10',
    'Giảm 10% cho đơn từ 5 triệu',
    'PHAN_TRAM',
    10,             -- 10%
    500000,         -- giảm tối đa 500k
    5000000,        -- đơn tối thiểu 5 triệu
    100,
    now(),
    now() + INTERVAL '30 days',
    'HOAT_DONG'
),
(
    'WELCOME50K',
    'Giảm 50k cho đơn đầu tiên',
    'SO_TIEN_CO_DINH',
    50000,          -- 50.000đ
    NULL,
    0,
    200,
    now(),
    now() + INTERVAL '90 days',
    'HOAT_DONG'
);
