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

-- ── 3) Seed 6 sản phẩm cho mỗi phân loại (Laptop + Laptop văn phòng) ─────
DO $$
DECLARE
    cat       RECORD;
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
    v_slug    TEXT;
    v_ten     TEXT;
    v_color   TEXT;
    v_vspecs  JSONB;
    v_specstr TEXT;
    v_img     TEXT;
    a_colors  TEXT[] := ARRAY['Đen','Bạc','Xám','Trắng','Xanh','Vàng'];
BEGIN
    FOR cat IN
        SELECT * FROM (VALUES
            ('Laptop',           'lpt', 12000000::bigint, 2500000::bigint),
            ('Laptop văn phòng', 'lvp',  9000000::bigint, 1500000::bigint)
        ) AS t(pl_name, prefix, gia_min, gia_step)
    LOOP
        SELECT pl.id INTO v_pl_id
        FROM phan_loai_san_pham pl JOIN danh_muc dm ON pl.danh_muc_id = dm.id
        WHERE dm.slug = 'laptop' AND pl.ten_phan_loai = cat.pl_name
        LIMIT 1;
        IF v_pl_id IS NULL THEN CONTINUE; END IF;
        IF (SELECT COUNT(*) FROM san_pham WHERE phan_loai_id = v_pl_id) >= 6 THEN CONTINUE; END IF;

        FOR i IN 1..6 LOOP
            v_brand := (ARRAY['ASUS','Acer','Dell','HP','Lenovo','MSI'])[i];
            v_color := a_colors[1 + ((i - 1) % 6)];
            v_gia   := cat.gia_min + cat.gia_step * ((i * 5) % 7);
            IF i % 2 = 0 THEN v_km := (v_gia * 9) / 10; ELSE v_km := NULL; END IF;
            v_diem  := round((35 + ((i * 13) % 16)) / 10.0, 1);
            v_sldg  := (i * 17) % 120;
            v_slban := (i * 29) % 300;
            v_ton   := 8 + (i * 7) % 60;
            v_ten   := v_brand || ' ' || cat.pl_name || ' ' || i;
            v_slug  := cat.prefix || '-' || v_pl_id || '-' || i;
            v_img   := 'https://picsum.photos/seed/' || cat.prefix || v_pl_id || i || '/500/500';

            -- Laptop văn phòng nghiêng về card tích hợp; Laptop phổ thông có card rời.
            v_vspecs := jsonb_build_object(
                'cpu', (ARRAY['Intel Core i3','Intel Core i5','Intel Core i5','Intel Core i7','AMD Ryzen 5','AMD Ryzen 7'])[i],
                'ram', (ARRAY['8GB','8GB','16GB','16GB','16GB','32GB'])[i],
                'o_cung', (ARRAY['256GB SSD','512GB SSD','512GB SSD','1TB SSD','512GB SSD','1TB SSD'])[i],
                'card_do_hoa', CASE WHEN cat.prefix = 'lvp'
                    THEN (ARRAY['Intel Iris Xe','Intel Iris Xe','AMD Radeon Graphics','Intel Iris Xe','AMD Radeon Graphics','Intel Iris Xe'])[i]
                    ELSE (ARRAY['Intel Iris Xe','NVIDIA RTX 3050','NVIDIA RTX 4050','NVIDIA RTX 4060','AMD Radeon Graphics','NVIDIA RTX 4060'])[i] END,
                'kich_thuoc_man_hinh', (ARRAY['13.3 inch','14 inch','14 inch','15.6 inch','15.6 inch','16 inch'])[i],
                'he_dieu_hanh', (ARRAY['Windows 11','Windows 11','Windows 11','Windows 11 Pro','Free DOS','Windows 11 Pro'])[i]);

            v_specstr := (SELECT string_agg(value, ' / ' ORDER BY key) FROM jsonb_each_text(v_vspecs));

            INSERT INTO san_pham (
                ten_san_pham, slug, mo_ta, mo_ta_ngan, phan_loai_id, thuong_hieu,
                anh_dai_dien, ban_do_bien_the, nhan_ids,
                diem_danh_gia_tb, so_luot_danh_gia, so_luot_ban, trang_thai, ngay_tao
            ) VALUES (
                v_ten, v_slug,
                v_ten || ' — hàng chính hãng, bảo hành 12 tháng, giao toàn quốc.',
                v_ten || ' chính hãng, bảo hành 12 tháng',
                v_pl_id, v_brand, v_img, '{}'::jsonb, '[]'::jsonb,
                v_diem, v_sldg, v_slban, 'CON_HANG', now() - (i || ' hours')::interval
            ) RETURNING id INTO v_sp_id;

            INSERT INTO bien_the_san_pham (
                san_pham_id, phan_loai_id, ma_bien_the, ten_bien_the, ten_san_pham, thuong_hieu,
                mau_sac, thong_so_bien_the, bien_the_gan_nhan, anh_bien_the_san_pham,
                gia, gia_khuyen_mai, so_luong_ton, so_luot_ban, so_luot_danh_gia,
                la_bien_the_mac_dinh, trang_thai, ngay_tao, ngay_cap_nhat
            ) VALUES (
                v_sp_id, v_pl_id, cat.prefix || '-' || v_pl_id || '-' || i || '-V1',
                v_specstr || ' / ' || v_color, v_ten, v_brand,
                v_color, v_vspecs, '{}'::jsonb, v_img,
                v_gia, v_km, v_ton, v_slban, v_sldg,
                true, 'CON_HANG', now(), now()
            ) RETURNING id INTO v_bt_id;

            INSERT INTO anh_san_pham (bien_the_id, url_anh, la_anh_chinh, thu_tu, ngay_tao)
            VALUES (v_bt_id, v_img, true, 0, now());

            UPDATE san_pham
            SET ban_do_bien_the = jsonb_build_object(v_specstr, jsonb_build_object(v_color, v_bt_id))
            WHERE id = v_sp_id;
        END LOOP;
    END LOOP;
END $$;
