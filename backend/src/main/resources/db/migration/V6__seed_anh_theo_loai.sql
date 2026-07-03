-- ============================================================
-- V6: Điền ẢNH theo LOẠI sản phẩm (Unsplash chọn sẵn, đúng chủ đề) cho card + chi tiết.
--   Card đọc bien_the_san_pham.anh_bien_the_san_pham (fallback san_pham.anh_dai_dien);
--   trang chi tiết đọc anh_san_pham. Chỉ điền chỗ đang NULL (không đè ảnh admin tự thêm).
--   Mỗi sản phẩm chọn 1 trong 2 ảnh của phân loại theo id → cùng loại đỡ trùng;
--   3 biến thể cùng SP dùng chung ảnh (chỉ khác màu).
-- ============================================================

DO $$
DECLARE
    v_default TEXT := 'https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=600&q=80&auto=format&fit=crop';
BEGIN
    -- Bảng map: slug phân loại → 2 ảnh đúng loại.
    CREATE TEMP TABLE tmp_anh_loai (slug TEXT, url TEXT, idx INT) ON COMMIT DROP;
    INSERT INTO tmp_anh_loai (slug, url, idx) VALUES
        -- Laptop
        ('pl-1',                  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-1',                  'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80&auto=format&fit=crop', 2),
        ('pl-laptop-a',           'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-laptop-a',           'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80&auto=format&fit=crop', 2),
        ('pl-laptop-van-phong',   'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-laptop-van-phong',   'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80&auto=format&fit=crop', 2),
        -- PC Gaming
        ('pl-2',                  'https://images.unsplash.com/photo-1626218174358-7769486c4b79?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-2',                  'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&q=80&auto=format&fit=crop', 2),
        -- Màn hình
        ('pl-3',                  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-3',                  'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=80&auto=format&fit=crop', 2),
        ('pl-man-hinh-roi',       'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-man-hinh-roi',       'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=80&auto=format&fit=crop', 2),
        -- RAM
        ('pl-4',                  'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-4',                  'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=600&q=80&auto=format&fit=crop', 2),
        ('pl-ram',                'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-ram',                'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=600&q=80&auto=format&fit=crop', 2),
        -- SSD + HDD (lưu trữ)
        ('pl-5',                  'https://images.unsplash.com/photo-1628557118391-56cd62c9f2cb?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-5',                  'https://images.unsplash.com/photo-1602526428496-8346b5cf9954?w=600&q=80&auto=format&fit=crop', 2),
        ('pl-o-cung-ssd',         'https://images.unsplash.com/photo-1628557118391-56cd62c9f2cb?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-o-cung-ssd',         'https://images.unsplash.com/photo-1602526428496-8346b5cf9954?w=600&q=80&auto=format&fit=crop', 2),
        ('pl-o-cung-hhd',         'https://images.unsplash.com/photo-1628557118391-56cd62c9f2cb?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-o-cung-hhd',         'https://images.unsplash.com/photo-1602526428496-8346b5cf9954?w=600&q=80&auto=format&fit=crop', 2),
        -- Card đồ họa
        ('pl-6',                  'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-6',                  'https://images.unsplash.com/photo-1555618254-84e2cf498b01?w=600&q=80&auto=format&fit=crop', 2),
        -- CPU
        ('pl-7',                  'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-7',                  'https://images.unsplash.com/photo-1540829917886-91ab031b1764?w=600&q=80&auto=format&fit=crop', 2),
        -- Chuột
        ('pl-8',                  'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-8',                  'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80&auto=format&fit=crop', 2),
        ('pl-chuot',              'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-chuot',              'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80&auto=format&fit=crop', 2),
        -- Bàn phím
        ('pl-9',                  'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-9',                  'https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=600&q=80&auto=format&fit=crop', 2),
        ('pl-ban-phim',           'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-ban-phim',           'https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=600&q=80&auto=format&fit=crop', 2),
        -- Lót chuột
        ('pl-lot-chuot',          'https://images.unsplash.com/photo-1659958661414-59d7bd483853?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-lot-chuot',          'https://images.unsplash.com/photo-1631098985305-d57413e94950?w=600&q=80&auto=format&fit=crop', 2),
        -- Tai nghe
        ('pl-tai-nghe',           'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-tai-nghe',           'https://images.unsplash.com/photo-1545127398-14699f92334b?w=600&q=80&auto=format&fit=crop', 2),
        -- Loa
        ('pl-loa',                'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-loa',                'https://images.unsplash.com/photo-1631972234521-24e9d4fbb841?w=600&q=80&auto=format&fit=crop', 2),
        -- Webcam
        ('pl-webcam-roi',         'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-webcam-roi',         'https://images.unsplash.com/photo-1614588876378-b2ffa4520c22?w=600&q=80&auto=format&fit=crop', 2),
        -- Hub USB + USB Wifi/Bluetooth
        ('pl-hub-usb',            'https://images.unsplash.com/photo-1616578273577-5d54546f4dec?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-hub-usb',            'https://images.unsplash.com/photo-1604005366359-2f8f2a044336?w=600&q=80&auto=format&fit=crop', 2),
        ('pl-bo-thu-phat-wifi-bluetooth', 'https://images.unsplash.com/photo-1616578273577-5d54546f4dec?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-bo-thu-phat-wifi-bluetooth', 'https://images.unsplash.com/photo-1604005366359-2f8f2a044336?w=600&q=80&auto=format&fit=crop', 2),
        -- USB Flash Drive
        ('pl-usb-flash-drive',    'https://images.unsplash.com/photo-1587145820098-23e484e69816?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-usb-flash-drive',    'https://images.unsplash.com/photo-1551818014-7c8ace9c1b5c?w=600&q=80&auto=format&fit=crop', 2),
        -- Sạc pin laptop
        ('pl-sac-pin-laptop',     'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80&auto=format&fit=crop', 1),
        ('pl-sac-pin-laptop',     'https://images.unsplash.com/photo-1517320069935-381614f8c1e5?w=600&q=80&auto=format&fit=crop', 2);

    -- Mỗi sản phẩm → 1 URL theo phân loại (chọn theo id để đa dạng).
    CREATE TEMP TABLE tmp_sp_anh ON COMMIT DROP AS
        SELECT sp.id AS san_pham_id, a.url
        FROM san_pham sp
        JOIN phan_loai_san_pham pl ON pl.id = sp.phan_loai_id
        JOIN (SELECT slug, COUNT(*) AS c FROM tmp_anh_loai GROUP BY slug) cnt ON cnt.slug = pl.slug
        JOIN tmp_anh_loai a ON a.slug = pl.slug AND a.idx = (sp.id % cnt.c) + 1;

    -- 1) Ảnh card (biến thể) — chỉ điền chỗ NULL.
    UPDATE bien_the_san_pham bt SET anh_bien_the_san_pham = s.url
    FROM tmp_sp_anh s WHERE bt.san_pham_id = s.san_pham_id AND bt.anh_bien_the_san_pham IS NULL;

    -- 2) Ảnh đại diện sản phẩm (fallback + ai-gateway/SanPhamMini).
    UPDATE san_pham sp SET anh_dai_dien = s.url
    FROM tmp_sp_anh s WHERE sp.id = s.san_pham_id AND sp.anh_dai_dien IS NULL;

    -- 3) Ảnh gallery cho trang chi tiết (mỗi biến thể 1 ảnh chính) — nếu biến thể chưa có ảnh.
    INSERT INTO anh_san_pham (san_pham_id, bien_the_id, url_anh, la_anh_chinh, thu_tu)
    SELECT bt.san_pham_id, bt.id, s.url, true, 0
    FROM bien_the_san_pham bt
    JOIN tmp_sp_anh s ON s.san_pham_id = bt.san_pham_id
    WHERE NOT EXISTS (SELECT 1 FROM anh_san_pham a WHERE a.bien_the_id = bt.id);

    -- 4) An toàn: biến thể nào còn NULL (phân loại lạ) → ảnh công nghệ mặc định.
    UPDATE bien_the_san_pham SET anh_bien_the_san_pham = v_default WHERE anh_bien_the_san_pham IS NULL;
    UPDATE san_pham SET anh_dai_dien = v_default WHERE anh_dai_dien IS NULL;
END $$;
