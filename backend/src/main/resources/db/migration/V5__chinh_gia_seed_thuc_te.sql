-- ============================================================
-- V5: Chỉnh giá các sản phẩm SEED DEMO (slug 'sp-v3-%') về mức THỰC TẾ theo loại
--     (laptop chục triệu, phụ kiện vài trăm nghìn...). Chỉ đụng hàng demo do V3 tạo,
--     KHÔNG đụng sản phẩm admin tự thêm. Cập nhật luôn giá thị trường (mock) cho khớp.
--   - Giá trải trong khoảng [gmin, gmax] theo phân loại, ổn định theo id biến thể.
--   - gia_khuyen_mai: biến thể nào đang có KM thì đặt lại = 90% giá mới; còn lại giữ null.
-- ============================================================

WITH band(slug, gmin, gmax) AS (VALUES
    ('pl-1',                          12000000::bigint, 35000000::bigint),  -- Laptop
    ('pl-2',                          15000000::bigint, 55000000::bigint),  -- PC Gaming
    ('pl-3',                           2500000::bigint, 15000000::bigint),  -- Màn hình
    ('pl-4',                            500000::bigint,  3500000::bigint),  -- RAM
    ('pl-5',                            700000::bigint,  6000000::bigint),  -- SSD
    ('pl-6',                           4000000::bigint, 45000000::bigint),  -- Card đồ họa
    ('pl-7',                           2500000::bigint, 20000000::bigint),  -- CPU
    ('pl-8',                            150000::bigint,  2500000::bigint),  -- Chuột
    ('pl-9',                            300000::bigint,  4500000::bigint),  -- Bàn phím
    ('pl-laptop-a',                   15000000::bigint, 40000000::bigint),
    ('pl-laptop-van-phong',           11000000::bigint, 25000000::bigint),
    ('pl-ram',                          500000::bigint,  3500000::bigint),
    ('pl-o-cung-ssd',                   700000::bigint,  6000000::bigint),
    ('pl-o-cung-hhd',                   600000::bigint,  4000000::bigint),
    ('pl-sac-pin-laptop',               200000::bigint,  1200000::bigint),
    ('pl-man-hinh-roi',                2500000::bigint, 18000000::bigint),
    ('pl-chuot',                        150000::bigint,  2500000::bigint),
    ('pl-ban-phim',                     300000::bigint,  4500000::bigint),
    ('pl-lot-chuot',                     80000::bigint,   600000::bigint),
    ('pl-tai-nghe',                     300000::bigint,  6000000::bigint),
    ('pl-loa',                          300000::bigint,  5000000::bigint),
    ('pl-webcam-roi',                   300000::bigint,  3000000::bigint),
    ('pl-hub-usb',                      150000::bigint,  1500000::bigint),
    ('pl-bo-thu-phat-wifi-bluetooth',   100000::bigint,   800000::bigint),
    ('pl-usb-flash-drive',               80000::bigint,  1000000::bigint)
),
calc AS (
    SELECT bt.id AS bt_id,
           GREATEST(
             ROUND(
               (COALESCE(b.gmin, 200000)
                + ((bt.id * 37) % 100)::numeric * (COALESCE(b.gmax, 2000000) - COALESCE(b.gmin, 200000)) / 100.0
               ) / 100000.0
             ) * 100000,
             100000
           ) AS gia_moi
    FROM bien_the_san_pham bt
    JOIN san_pham sp ON sp.id = bt.san_pham_id
    JOIN phan_loai_san_pham pl ON pl.id = sp.phan_loai_id
    LEFT JOIN band b ON b.slug = pl.slug
    WHERE sp.slug LIKE 'sp-v3-%'
)
UPDATE bien_the_san_pham bt
SET gia = c.gia_moi,
    gia_khuyen_mai = CASE WHEN bt.gia_khuyen_mai IS NOT NULL
                          THEN ROUND(c.gia_moi * 0.9 / 100000.0) * 100000
                          ELSE NULL END,
    ngay_cap_nhat = now()
FROM calc c
WHERE bt.id = c.bt_id;

-- Cập nhật giá thị trường (mock) ≈ giá mới ±10% cho khớp.
UPDATE gia_thi_truong g
SET gia_thi_truong = GREATEST(ROUND(bt.gia * (0.9 + random() * 0.2) / 100000.0) * 100000, 100000),
    ngay_cap_nhat = now()
FROM bien_the_san_pham bt
JOIN san_pham sp ON sp.id = bt.san_pham_id
WHERE g.bien_the_id = bt.id AND sp.slug LIKE 'sp-v3-%';
