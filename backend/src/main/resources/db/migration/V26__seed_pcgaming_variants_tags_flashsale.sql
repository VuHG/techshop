-- ============================================================
-- V26:
--   1) Thêm 6 sản phẩm (=6 card) cho phân loại "PC Gaming".
--   2) Mỗi sản phẩm có < 2 biến thể → thêm 1 biến thể nữa (đổi màu) cho đủ >= 2.
--   3) Dựng lại ban_do_bien_the toàn bộ (khớp V14).
--   4) Gắn 1 thẻ bất kỳ cho MỌI biến thể chưa có thẻ + dựng lại bien_the_gan_nhan.
--   5) Đưa >= 1 biến thể của TỪNG phân loại vào flash sale.
-- Chỉ seed dữ liệu, không đổi schema.
-- ============================================================

-- ── 1) Seed 6 sản phẩm PC Gaming ─────────────────────────────
DO $$
DECLARE
    v_pl_id   BIGINT;
    v_sp_id   BIGINT;
    v_bt_id   BIGINT;
    i         INT;
    v_brand   TEXT;
    v_gia     BIGINT;
    v_km      BIGINT;
    v_diem    NUMERIC;
    v_sldg    INT;
    v_slban   INT;
    v_ton     INT;
    v_ten     TEXT;
    v_color   TEXT;
    v_vspecs  JSONB;
    v_specstr TEXT;
    v_img     TEXT;
    a_colors  TEXT[] := ARRAY['Đen','Trắng','Đỏ','Xanh','Bạc','Xám'];
    a_brands  TEXT[] := ARRAY['GearVN','ASUS','MSI','Corsair','Acer','ASRock'];
BEGIN
    SELECT pl.id INTO v_pl_id
    FROM phan_loai_san_pham pl JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'pc-gaming' AND pl.ten_phan_loai = 'PC Gaming' LIMIT 1;

    IF v_pl_id IS NOT NULL THEN
        FOR i IN 1..6 LOOP
            v_brand := a_brands[i];
            v_color := a_colors[i];
            v_gia   := 18000000 + 3000000 * ((i * 5) % 7);
            IF i % 2 = 0 THEN v_km := (v_gia * 9) / 10; ELSE v_km := NULL; END IF;
            v_diem  := round((35 + ((i * 13) % 16)) / 10.0, 1);
            v_sldg  := (i * 17) % 120;
            v_slban := (i * 29) % 300;
            v_ton   := 8 + (i * 7) % 60;
            v_ten   := v_brand || ' PC Gaming ' || i;
            v_img   := 'https://picsum.photos/seed/pcg' || v_pl_id || i || '/500/500';

            v_vspecs := jsonb_build_object(
                'cpu', (ARRAY['Intel Core i5','Intel Core i7','Intel Core i9','AMD Ryzen 5','AMD Ryzen 7','AMD Ryzen 9'])[i],
                'mainboard', (ARRAY['ASUS B760','MSI B650','Gigabyte Z790','ASRock X670E','ASUS B760','MSI B650'])[i],
                'vga', (ARRAY['NVIDIA RTX 4060','NVIDIA RTX 4070','NVIDIA RTX 4080','AMD Radeon RX 7600','AMD Radeon RX 7800 XT','NVIDIA RTX 4070'])[i],
                'ram', (ARRAY['16GB','16GB','32GB','32GB','64GB','32GB'])[i],
                'psu', (ARRAY['650W','750W','850W','750W','1000W','850W'])[i]);
            v_specstr := (SELECT string_agg(value, ' / ' ORDER BY key) FROM jsonb_each_text(v_vspecs));

            INSERT INTO san_pham (
                ten_san_pham, slug, mo_ta, mo_ta_ngan, phan_loai_id, thuong_hieu,
                anh_dai_dien, ban_do_bien_the, nhan_ids,
                diem_danh_gia_tb, so_luot_danh_gia, so_luot_ban, trang_thai, ngay_tao
            ) VALUES (
                v_ten, 'pcg-' || v_pl_id || '-' || i,
                v_ten || ' — PC lắp ráp chính hãng, bảo hành 36 tháng.',
                v_ten || ' chính hãng, bảo hành 36 tháng',
                v_pl_id, v_brand, v_img, '{}'::jsonb, '[]'::jsonb,
                v_diem, v_sldg, v_slban, 'CON_HANG', now() - (i || ' hours')::interval
            ) RETURNING id INTO v_sp_id;

            INSERT INTO bien_the_san_pham (
                san_pham_id, phan_loai_id, ma_bien_the, ten_bien_the, ten_san_pham, thuong_hieu,
                mau_sac, thong_so_bien_the, bien_the_gan_nhan, anh_bien_the_san_pham,
                gia, gia_khuyen_mai, so_luong_ton, so_luot_ban, so_luot_danh_gia,
                la_bien_the_mac_dinh, trang_thai, ngay_tao, ngay_cap_nhat
            ) VALUES (
                v_sp_id, v_pl_id, 'pcg-' || v_pl_id || '-' || i || '-V1',
                v_specstr || ' / ' || v_color, v_ten, v_brand,
                v_color, v_vspecs, '{}'::jsonb, v_img,
                v_gia, v_km, v_ton, v_slban, v_sldg,
                true, 'CON_HANG', now(), now()
            ) RETURNING id INTO v_bt_id;

            INSERT INTO anh_san_pham (bien_the_id, url_anh, la_anh_chinh, thu_tu, ngay_tao)
            VALUES (v_bt_id, v_img, true, 0, now());
        END LOOP;
    END IF;
END $$;

-- ── 2) Thêm biến thể thứ 2 (đổi màu) cho mọi SP đang có đúng 1 biến thể ──
INSERT INTO bien_the_san_pham (
    san_pham_id, phan_loai_id, ma_bien_the, ten_bien_the, ten_san_pham, thuong_hieu,
    mau_sac, thong_so_bien_the, bien_the_gan_nhan, anh_bien_the_san_pham,
    gia, gia_khuyen_mai, so_luong_ton, so_luot_ban, so_luot_danh_gia,
    la_bien_the_mac_dinh, trang_thai, ngay_tao, ngay_cap_nhat
)
SELECT
    bt.san_pham_id, bt.phan_loai_id,
    COALESCE(bt.ma_bien_the, 'BT' || bt.id) || '-V2',
    CASE WHEN spec.s = '' THEN c.color2 ELSE spec.s || ' / ' || c.color2 END,
    bt.ten_san_pham, bt.thuong_hieu, c.color2,
    bt.thong_so_bien_the, '{}'::jsonb, bt.anh_bien_the_san_pham,
    bt.gia, bt.gia_khuyen_mai, GREATEST(5, bt.so_luong_ton / 2), 0, 0,
    false, 'CON_HANG', now(), now()
FROM bien_the_san_pham bt
JOIN (
    SELECT san_pham_id FROM bien_the_san_pham GROUP BY san_pham_id HAVING COUNT(*) = 1
) one ON one.san_pham_id = bt.san_pham_id
CROSS JOIN LATERAL (
    SELECT COALESCE((SELECT string_agg(value, ' / ' ORDER BY key) FROM jsonb_each_text(bt.thong_so_bien_the)), '') AS s
) spec
CROSS JOIN LATERAL (
    SELECT CASE WHEN COALESCE(bt.mau_sac, '') = 'Đen' THEN 'Bạc' ELSE 'Đen' END AS color2
) c;

-- ── 3) Dựng lại ban_do_bien_the cho TẤT CẢ sản phẩm (khớp V14) ──
WITH spec AS (
    SELECT bt.id, bt.san_pham_id,
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

-- ── 4) Gắn 1 thẻ bất kỳ cho mọi biến thể CHƯA có thẻ (phân bổ theo id) ──
INSERT INTO bien_the_nhan (bien_the_id, nhan_id, ngay_tao)
SELECT bt.id, n.id, now()
FROM bien_the_san_pham bt
CROSS JOIN LATERAL (
    SELECT id FROM nhan_san_pham WHERE trang_thai = 'ACTIVE' ORDER BY id
    OFFSET (bt.id % GREATEST(1, (SELECT COUNT(*) FROM nhan_san_pham WHERE trang_thai = 'ACTIVE')))
    LIMIT 1
) n
WHERE NOT EXISTS (SELECT 1 FROM bien_the_nhan bn WHERE bn.bien_the_id = bt.id);

-- Dựng lại bien_the_gan_nhan (JSON denormalize) cho TẤT CẢ biến thể (khớp V18).
UPDATE bien_the_san_pham bt
SET bien_the_gan_nhan = COALESCE((
    SELECT jsonb_object_agg(
               n.id::text,
               jsonb_build_array(n.ten_nhan, n.mau_sac, n.thu_tu_hien_thi, n.trang_thai))
    FROM bien_the_nhan bn JOIN nhan_san_pham n ON bn.nhan_id = n.id
    WHERE bn.bien_the_id = bt.id
), '{}'::jsonb);

-- ── 5) Flash sale: >= 1 biến thể cho TỪNG phân loại (giá flash = 80% giá) ──
INSERT INTO flashsale (
    bien_the_id, gia_flash_sale, thoi_gian_bat_dau, thoi_gian_ket_thuc,
    so_luong_gioi_han, so_luong_da_ban, trang_thai, ngay_tao, ngay_cap_nhat
)
SELECT DISTINCT ON (sp.phan_loai_id)
    bt.id,
    GREATEST(1000, round(bt.gia * 0.8, -3)),
    now() - interval '1 hour',
    now() + interval '30 days',
    50, 0, 'HOAT_DONG', now(), now()
FROM bien_the_san_pham bt
JOIN san_pham sp ON bt.san_pham_id = sp.id
WHERE bt.trang_thai = 'CON_HANG' AND sp.trang_thai = 'CON_HANG'
  AND bt.gia > 0
  AND NOT EXISTS (SELECT 1 FROM flashsale f WHERE f.bien_the_id = bt.id)
ORDER BY sp.phan_loai_id, bt.la_bien_the_mac_dinh DESC, bt.id;
