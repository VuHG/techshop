-- ============================================================
-- V6: Seed THÊM sản phẩm để test (15 SP / phân loại, 10 phân loại = 150 SP)
-- Đa dạng giá / điểm đánh giá / lượt bán / khuyến mãi / nhãn để test
-- phân trang, lọc khoảng giá, sắp xếp (newest/rating/sold).
-- Sinh bằng khối DO (PL/pgSQL) — KHÔNG hardcode id, dùng RETURNING.
-- ============================================================

-- Bảo đảm danh mục "Tai nghe" (slug 'tai-nghe') có phân loại để bày sản phẩm.
INSERT INTO phan_loai_san_pham (ten_phan_loai, danh_muc_id)
SELECT 'Tai nghe', (SELECT id FROM danh_muc WHERE slug = 'tai-nghe')
WHERE NOT EXISTS (
    SELECT 1 FROM phan_loai_san_pham WHERE ten_phan_loai = 'Tai nghe'
);

DO $$
DECLARE
    cat        RECORD;
    v_pl_id    BIGINT;
    v_sp_id    BIGINT;
    v_bt_id    BIGINT;
    i          INT;
    v_brand    TEXT;
    v_gia      BIGINT;
    v_km       BIGINT;
    v_diem     NUMERIC;
    v_sldg     INT;
    v_slban    INT;
    v_ton      INT;
    v_slug     TEXT;
    v_ten      TEXT;
    v_specs    JSONB;
    v_vspecs   JSONB;
    v_ram      TEXT;
    v_stor     TEXT;
    v_cpu      TEXT;
    v_color    TEXT;
    a_rams     TEXT[] := ARRAY['8GB','16GB','32GB'];
    a_stors    TEXT[] := ARRAY['256GB','512GB','1TB'];
    a_cpus     TEXT[] := ARRAY['Intel Core i5','Intel Core i7','AMD Ryzen 5','AMD Ryzen 7'];
    a_colors   TEXT[] := ARRAY['Đen','Bạc','Trắng','Xám'];
BEGIN
    FOR cat IN
        SELECT * FROM (VALUES
            ('Laptop',      'laptop',    'Laptop',      ARRAY['ASUS','Acer','Dell','HP','Lenovo','MSI'],      12000000::bigint, 1800000::bigint),
            ('PC Gaming',   'pcg',       'PC Gaming',   ARRAY['GearVN','ASUS','MSI','Corsair','Acer'],        18000000::bigint, 3000000::bigint),
            ('Màn hình',    'monitor',   'Màn hình',    ARRAY['LG','Dell','Samsung','ASUS','ViewSonic'],       2500000::bigint,  700000::bigint),
            ('RAM',         'ram',       'RAM',         ARRAY['Corsair','Kingston','G.Skill','TeamGroup'],      700000::bigint,  350000::bigint),
            ('SSD',         'ssd',       'SSD',         ARRAY['Samsung','WD','Kingston','Crucial'],             900000::bigint,  450000::bigint),
            ('Card đồ họa', 'vga',       'VGA',         ARRAY['ASUS','MSI','Gigabyte','Colorful','Zotac'],     6000000::bigint, 3500000::bigint),
            ('CPU',         'cpu',       'CPU',         ARRAY['Intel','AMD'],                                  3000000::bigint, 1300000::bigint),
            ('Chuột',       'mouse',     'Chuột',       ARRAY['Logitech','Razer','SteelSeries','Corsair'],      350000::bigint,  250000::bigint),
            ('Bàn phím',    'keyboard',  'Bàn phím',    ARRAY['Keychron','Akko','Logitech','Razer','Durgod'],   600000::bigint,  350000::bigint),
            ('Tai nghe',    'headphone', 'Tai nghe',    ARRAY['Sony','Sennheiser','Logitech','HyperX','JBL'],   800000::bigint,  500000::bigint)
        ) AS t(ten_pl, prefix, base, brands, gia_min, gia_step)
    LOOP
        SELECT id INTO v_pl_id FROM phan_loai_san_pham WHERE ten_phan_loai = cat.ten_pl LIMIT 1;
        IF v_pl_id IS NULL THEN CONTINUE; END IF;

        FOR i IN 1..15 LOOP
            v_brand := (cat.brands)[1 + (i % array_length(cat.brands, 1))];
            v_ram   := a_rams[1 + (i % 3)];
            v_stor  := a_stors[1 + (i % 3)];
            v_cpu   := a_cpus[1 + (i % 4)];
            v_color := a_colors[1 + (i % 4)];

            v_gia   := cat.gia_min + cat.gia_step * ((i * 7) % 13);
            IF i % 3 = 0 THEN v_km := (v_gia * 9) / 10; ELSE v_km := NULL; END IF;
            v_diem  := round((35 + ((i * 13) % 16)) / 10.0, 1);  -- 3.5 .. 5.0
            v_sldg  := (i * 17) % 200;
            v_slban := (i * 23) % 350;
            v_ton   := 5 + (i * 11) % 90;
            v_ten   := v_brand || ' ' || cat.base || ' ' || i;
            v_slug  := cat.prefix || '-' || i;

            -- Thông số kỹ thuật chung + thông số biến thể theo từng phân loại
            CASE cat.ten_pl
                WHEN 'Laptop' THEN
                    v_specs  := jsonb_build_object('man_hinh','15.6 inch FHD IPS','cpu',v_cpu,'card_do_hoa','Intel Iris Xe','pin','60Wh','he_dieu_hanh','Windows 11');
                    v_vspecs := jsonb_build_object('ram',v_ram,'storage',v_stor,'color',v_color);
                WHEN 'PC Gaming' THEN
                    v_specs  := jsonb_build_object('cpu',v_cpu,'vga','NVIDIA RTX 4060','mainboard','B760','nguon','650W 80+ Bronze','tan_nhiet','Air Cooler');
                    v_vspecs := jsonb_build_object('ram',v_ram,'storage',v_stor);
                WHEN 'Màn hình' THEN
                    v_specs  := jsonb_build_object('kich_thuoc','27 inch','tam_nen','IPS','do_phan_giai','2K QHD','tan_so_quet','165Hz','cong_ket_noi','HDMI, DisplayPort');
                    v_vspecs := jsonb_build_object('phien_ban','Bản ' || i);
                WHEN 'RAM' THEN
                    v_specs  := jsonb_build_object('dung_luong',v_ram,'bus','5600MHz','loai','DDR5','tan_nhiet','Có');
                    v_vspecs := jsonb_build_object('dung_luong',v_ram);
                WHEN 'SSD' THEN
                    v_specs  := jsonb_build_object('dung_luong',v_stor,'chuan','NVMe PCIe 4.0','toc_do_doc','7000MB/s','bao_hanh','5 năm');
                    v_vspecs := jsonb_build_object('dung_luong',v_stor);
                WHEN 'Card đồ họa' THEN
                    v_specs  := jsonb_build_object('chip','NVIDIA GeForce','vram','8GB GDDR6','xung_nhip','2550MHz','cong','3x DP, 1x HDMI');
                    v_vspecs := jsonb_build_object('phien_ban','OC Edition');
                WHEN 'CPU' THEN
                    v_specs  := jsonb_build_object('socket','LGA1700','so_nhan','8','so_luong','16','xung_nhip','4.5GHz','tien_trinh','7nm');
                    v_vspecs := jsonb_build_object('phien_ban','Box');
                WHEN 'Chuột' THEN
                    v_specs  := jsonb_build_object('dpi','26000','ket_noi','Wireless 2.4GHz','trong_luong','63g','led','RGB');
                    v_vspecs := jsonb_build_object('color',v_color);
                WHEN 'Bàn phím' THEN
                    v_specs  := jsonb_build_object('switch','Gateron Red','layout','TKL 87 phím','led','RGB','ket_noi','Bluetooth / USB-C');
                    v_vspecs := jsonb_build_object('color',v_color);
                WHEN 'Tai nghe' THEN
                    v_specs  := jsonb_build_object('kieu','Over-ear','chong_on','ANC','thoi_luong_pin','30 giờ','ket_noi','Bluetooth 5.3');
                    v_vspecs := jsonb_build_object('color',v_color);
                ELSE
                    v_specs  := jsonb_build_object('ghi_chu','Sản phẩm công nghệ');
                    v_vspecs := jsonb_build_object('phien_ban','Tiêu chuẩn');
            END CASE;

            INSERT INTO san_pham (
                ten_san_pham, slug, mo_ta, mo_ta_ngan, phan_loai_id, thuong_hieu,
                thong_so_ky_thuat, diem_danh_gia_tb, so_luot_danh_gia, so_luot_ban,
                trang_thai, ngay_tao
            ) VALUES (
                v_ten,
                v_slug,
                v_ten || ' — sản phẩm chính hãng, bảo hành 12 tháng, giao hàng toàn quốc.',
                v_ten || ' chính hãng, bảo hành 12 tháng',
                v_pl_id,
                v_brand,
                v_specs,
                v_diem,
                v_sldg,
                v_slban,
                'CON_HANG',
                now() - (i || ' hours')::interval
            ) RETURNING id INTO v_sp_id;

            INSERT INTO bien_the_san_pham (
                san_pham_id, ma_bien_the, thong_so_bien_the,
                gia, gia_khuyen_mai, so_luong_ton, trang_thai
            ) VALUES (
                v_sp_id,
                cat.prefix || '-' || i || '-V1',
                v_vspecs,
                v_gia,
                v_km,
                v_ton,
                'CON_HANG'
            ) RETURNING id INTO v_bt_id;

            -- Gắn nhãn (Hot=1, Sale=2, Mới về=3, Bán chạy=5)
            IF v_km IS NOT NULL THEN
                INSERT INTO bien_the_nhan (bien_the_id, nhan_id) VALUES (v_bt_id, 2);
            END IF;
            IF i % 4 = 0 THEN
                INSERT INTO bien_the_nhan (bien_the_id, nhan_id) VALUES (v_bt_id, 1);
            END IF;
            IF i % 5 = 0 THEN
                INSERT INTO bien_the_nhan (bien_the_id, nhan_id) VALUES (v_bt_id, 3);
            END IF;
            IF v_slban > 250 THEN
                INSERT INTO bien_the_nhan (bien_the_id, nhan_id) VALUES (v_bt_id, 5);
            END IF;
        END LOOP;
    END LOOP;
END $$;
