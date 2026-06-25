-- ============================================================
-- V24: Seed >= 6 sản phẩm (mỗi SP = 1 biến thể = 1 product card) cho từng
--      phân loại đang TRỐNG (Laptop A + Linh kiện + Phụ kiện). Laptop & PC Gaming
--      đã có sẵn nhiều SP nên bỏ qua (guard COUNT >= 6).
--   - thong_so_bien_the dùng đúng ma_thuoc_tinh đã seed ở V22/V23 → card hiển thị
--     thông số đẹp và lọc theo tiêu chí khớp.
--   - ban_do_bien_the = { "<chuỗi thông số>": { "<màu>": <id biến thể> } } (khớp V14).
--   - Schema hiện tại (V23): biến thể có ten_san_pham/thuong_hieu/anh_bien_the_san_pham
--     denormalize; nhan_ids='[]', bien_the_gan_nhan='{}'.
-- ============================================================

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
    a_colors  TEXT[] := ARRAY['Đen','Trắng','Bạc','Xám','Xanh','Đỏ'];
BEGIN
    FOR cat IN
        SELECT * FROM (VALUES
            ('pl-laptop-a',                  'lpa', 'Laptop',     ARRAY['ASUS','Acer','Dell','HP','Lenovo','MSI'],          15000000::bigint, 2000000::bigint),
            ('pl-ram',                       'ram', 'RAM',        ARRAY['Corsair','Kingston','G.Skill','TeamGroup','ADATA','Crucial'], 700000::bigint, 300000::bigint),
            ('pl-o-cung-ssd',                'ssd', 'SSD',        ARRAY['Samsung','WD','Kingston','Crucial','ADATA','Seagate'], 900000::bigint, 400000::bigint),
            ('pl-o-cung-hhd',                'hdd', 'HDD',        ARRAY['Seagate','WD','Toshiba','HGST'],                    800000::bigint,  300000::bigint),
            ('pl-sac-pin-laptop',            'sac', 'Sạc laptop', ARRAY['Dell','HP','Asus','Lenovo','Acer'],                 350000::bigint,  150000::bigint),
            ('pl-man-hinh-roi',              'mhr', 'Màn hình',   ARRAY['LG','Dell','Samsung','ASUS','ViewSonic','AOC'],    2500000::bigint,  800000::bigint),
            ('pl-chuot',                     'mou', 'Chuột',      ARRAY['Logitech','Razer','SteelSeries','Corsair','Dare-U'], 350000::bigint, 200000::bigint),
            ('pl-ban-phim',                  'kbd', 'Bàn phím',   ARRAY['Keychron','Akko','Logitech','Razer','Durgod'],      600000::bigint,  350000::bigint),
            ('pl-lot-chuot',                 'pad', 'Lót chuột',  ARRAY['SteelSeries','Razer','Logitech','Corsair'],         120000::bigint,   80000::bigint),
            ('pl-tai-nghe',                  'hps', 'Tai nghe',   ARRAY['Sony','Sennheiser','Logitech','HyperX','JBL'],      800000::bigint,  400000::bigint),
            ('pl-loa',                       'spk', 'Loa',        ARRAY['Edifier','Logitech','Sony','JBL','Harman'],         700000::bigint,  350000::bigint),
            ('pl-webcam-roi',                'cam', 'Webcam',     ARRAY['Logitech','Razer','Anker','Rapoo'],                 600000::bigint,  300000::bigint),
            ('pl-hub-usb',                   'hub', 'Hub USB',    ARRAY['Ugreen','Anker','Orico','Baseus'],                  300000::bigint,  150000::bigint),
            ('pl-bo-thu-phat-wifi-bluetooth','wbt', 'USB Wifi',   ARRAY['TP-Link','Tenda','Ugreen','Mercusys'],              200000::bigint,  120000::bigint),
            ('pl-usb-flash-drive',           'usb', 'USB',        ARRAY['Kingston','SanDisk','Samsung','PNY'],               150000::bigint,  100000::bigint)
        ) AS t(slug, prefix, base, brands, gia_min, gia_step)
    LOOP
        SELECT id INTO v_pl_id FROM phan_loai_san_pham WHERE slug = cat.slug LIMIT 1;
        IF v_pl_id IS NULL THEN CONTINUE; END IF;
        IF (SELECT COUNT(*) FROM san_pham WHERE phan_loai_id = v_pl_id) >= 6 THEN CONTINUE; END IF;

        FOR i IN 1..6 LOOP
            v_brand := (cat.brands)[1 + ((i - 1) % array_length(cat.brands, 1))];
            v_color := a_colors[1 + ((i - 1) % 6)];
            v_gia   := cat.gia_min + cat.gia_step * ((i * 5) % 7);
            IF i % 2 = 0 THEN v_km := (v_gia * 9) / 10; ELSE v_km := NULL; END IF;
            v_diem  := round((35 + ((i * 13) % 16)) / 10.0, 1);   -- 3.5 .. 5.0
            v_sldg  := (i * 17) % 120;
            v_slban := (i * 29) % 300;
            v_ton   := 8 + (i * 7) % 60;
            v_ten   := v_brand || ' ' || cat.base || ' ' || i;
            v_slug  := cat.prefix || '-' || v_pl_id || '-' || i;   -- kèm id phân loại → chắc chắn không trùng slug cũ
            v_img   := 'https://picsum.photos/seed/' || cat.prefix || v_pl_id || i || '/500/500';

            CASE cat.slug
                WHEN 'pl-laptop-a' THEN
                    v_vspecs := jsonb_build_object(
                        'cpu', (ARRAY['Intel Core i3','Intel Core i5','Intel Core i7','Intel Core i9','AMD Ryzen 5','AMD Ryzen 7'])[i],
                        'ram', (ARRAY['8GB','16GB','16GB','32GB','16GB','32GB'])[i],
                        'o_cung', (ARRAY['256GB SSD','512GB SSD','512GB SSD','1TB SSD','512GB SSD','1TB SSD'])[i],
                        'card_do_hoa', (ARRAY['Intel Iris Xe','NVIDIA RTX 3050','NVIDIA RTX 4050','NVIDIA RTX 4060','AMD Radeon Graphics','NVIDIA RTX 4060'])[i],
                        'kich_thuoc_man_hinh', (ARRAY['13.3 inch','14 inch','15.6 inch','16 inch','15.6 inch','17.3 inch'])[i],
                        'he_dieu_hanh', (ARRAY['Windows 11','Windows 11','Windows 11 Pro','Windows 11 Pro','Free DOS','macOS'])[i]);
                WHEN 'pl-ram' THEN
                    v_vspecs := jsonb_build_object(
                        'the_he_ram', (ARRAY['DDR4','DDR4','DDR5','DDR5','DDR4','DDR5'])[i],
                        'dung_luong', (ARRAY['8GB','16GB','16GB','32GB','8GB','32GB'])[i],
                        'toc_do_bus', (ARRAY['3200MHz','3200MHz','5200MHz','6000MHz','2666MHz','6000MHz'])[i],
                        'loai_ram', (ARRAY['PC (U-DIMM)','Laptop (SO-DIMM)','PC (U-DIMM)','PC (U-DIMM)','Laptop (SO-DIMM)','PC (U-DIMM)'])[i]);
                WHEN 'pl-o-cung-ssd' THEN
                    v_vspecs := jsonb_build_object(
                        'chuan_cam', (ARRAY['SATA III','M.2','M.2','M.2','SATA III','M.2'])[i],
                        'giao_thuc_truyen_tai', (ARRAY['SATA','NVMe','NVMe','NVMe','SATA','NVMe'])[i],
                        'bang_thong', (ARRAY['PCIe 3.0','PCIe 3.0','PCIe 4.0','PCIe 4.0','SATA 6Gb/s','PCIe 4.0'])[i],
                        'dung_luong', (ARRAY['256GB','512GB','512GB','1TB','256GB','2TB'])[i]);
                WHEN 'pl-o-cung-hhd' THEN
                    v_vspecs := jsonb_build_object(
                        'dung_luong', (ARRAY['1TB','2TB','2TB','4TB','1TB','4TB'])[i],
                        'toc_do_quay', (ARRAY['5400RPM','7200RPM','7200RPM','7200RPM','5400RPM','7200RPM'])[i],
                        'chuan_giao_tiep', (ARRAY['SATA III','SATA III','SATA III','SATA III','SATA III','SATA III'])[i],
                        'kich_thuoc', (ARRAY['3.5 inch','3.5 inch','3.5 inch','3.5 inch','2.5 inch','3.5 inch'])[i]);
                WHEN 'pl-sac-pin-laptop' THEN
                    v_vspecs := jsonb_build_object(
                        'loai_chan_cam', (ARRAY['USB-C','DC Tròn','DC Tròn','USB-C','DC Dẹt','USB-C'])[i],
                        'cong_suat', (ARRAY['45W','65W','65W','90W','120W','100W'])[i]);
                WHEN 'pl-man-hinh-roi' THEN
                    v_vspecs := jsonb_build_object(
                        'kieu_man_hinh', (ARRAY['Phẳng','Phẳng','Cong','Phẳng','Cong','Phẳng'])[i],
                        'kich_thuoc_man_hinh', (ARRAY['24 inch','27 inch','27 inch','32 inch','34 inch','27 inch'])[i],
                        'do_phan_giai', (ARRAY['Full HD (1920x1080)','2K (2560x1440)','2K (2560x1440)','4K (3840x2160)','Ultrawide (3440x1440)','4K (3840x2160)'])[i],
                        'tan_so_quet', (ARRAY['75Hz','144Hz','165Hz','144Hz','165Hz','240Hz'])[i],
                        'tam_nen', (ARRAY['IPS','IPS','VA','IPS','VA','OLED'])[i],
                        'thoi_gian_phan_hoi', (ARRAY['5ms','1ms','1ms','2ms','1ms','1ms'])[i]);
                WHEN 'pl-chuot' THEN
                    v_vspecs := jsonb_build_object(
                        'kieu_ket_noi', (ARRAY['Có dây','Không dây','Không dây','Có dây','Không dây','Bluetooth'])[i],
                        'dpi', (ARRAY['6400','12000','16000','20000','26000','30000'])[i],
                        'so_nut', (ARRAY['5','6','6','8','7','8'])[i],
                        'cam_bien', (ARRAY['Optical','Optical','PixArt 3389','PixArt 3395','Focus Pro','Hero 25K'])[i]);
                WHEN 'pl-ban-phim' THEN
                    v_vspecs := jsonb_build_object(
                        'kieu_ket_noi', (ARRAY['Có dây','Không dây','Bluetooth','Có dây','Không dây','Bluetooth'])[i],
                        'loai_switch', (ARRAY['Red','Brown','Blue','Red','Brown','Optical'])[i],
                        'layout', (ARRAY['Fullsize','TKL','75%','65%','TKL','60%'])[i],
                        'den_nen', (ARRAY['RGB','RGB','Single','RGB','Không','RGB'])[i]);
                WHEN 'pl-lot-chuot' THEN
                    v_vspecs := jsonb_build_object(
                        'kich_thuoc', (ARRAY['S','M','L','XL','L','XXL'])[i],
                        'chat_lieu_be_mat', (ARRAY['Vải','Vải','Cao su','Vải','Kính cường lực','Vải'])[i],
                        'do_day', (ARRAY['2mm','3mm','3mm','4mm','3mm','5mm'])[i],
                        'den_led', (ARRAY['Không','RGB','RGB','Không','RGB','RGB'])[i]);
                WHEN 'pl-tai-nghe' THEN
                    v_vspecs := jsonb_build_object(
                        'kieu_ket_noi', (ARRAY['Có dây','Bluetooth','Bluetooth','Có dây','Không dây 2.4GHz','Bluetooth'])[i],
                        'kieu_dang', (ARRAY['In-ear','Over-ear','Over-ear','On-ear','Over-ear','True Wireless'])[i],
                        'tinh_nang', (ARRAY['Mic','Chống ồn ANC','Chống ồn ANC','Mic','Surround 7.1','Chống ồn ANC'])[i],
                        'driver', (ARRAY['10mm','40mm','40mm','30mm','50mm','12mm'])[i]);
                WHEN 'pl-loa' THEN
                    v_vspecs := jsonb_build_object(
                        'kieu_ket_noi', (ARRAY['Có dây','Bluetooth','Bluetooth','Có dây','Không dây','Bluetooth'])[i],
                        'kieu_loa', (ARRAY['2.0','2.1','2.1','Soundbar','5.1','2.0'])[i],
                        'cong_suat', (ARRAY['10W','30W','60W','40W','120W','20W'])[i],
                        'tinh_nang', (ARRAY['Cơ bản','LED RGB','LED RGB','Bluetooth','Subwoofer','LED RGB'])[i]);
                WHEN 'pl-webcam-roi' THEN
                    v_vspecs := jsonb_build_object(
                        'do_phan_giai', (ARRAY['720p','1080p','1080p','2K','4K','1080p'])[i],
                        'tan_so_khung_hinh', (ARRAY['30fps','30fps','60fps','60fps','60fps','30fps'])[i],
                        'goc_nhin', (ARRAY['65 độ','78 độ','90 độ','90 độ','120 độ','78 độ'])[i],
                        'tinh_nang', (ARRAY['Mic','Mic + Autofocus','Mic + Autofocus','HDR','HDR + Tracking','Mic'])[i]);
                WHEN 'pl-hub-usb' THEN
                    v_vspecs := jsonb_build_object(
                        'cong_ket_noi', (ARRAY['USB-A','USB-C','USB-C','USB-C','USB-C','USB-A'])[i],
                        'so_cong', (ARRAY['3','4','5','6','7','4'])[i],
                        'chuan_usb', (ARRAY['USB 3.0','USB 3.0','USB 3.1','USB 3.2','Thunderbolt','USB 3.0'])[i],
                        'cong_mo_rong', (ARRAY['USB','USB + SD','HDMI + USB','HDMI + LAN','HDMI + LAN + SD','USB'])[i]);
                WHEN 'pl-bo-thu-phat-wifi-bluetooth' THEN
                    v_vspecs := jsonb_build_object(
                        'chuan_ket_noi', (ARRAY['USB','USB','PCIe','USB','PCIe','USB'])[i],
                        'chuan_wifi', (ARRAY['Wifi 5','Wifi 5','Wifi 6','Wifi 6','Wifi 6E','Wifi 5'])[i],
                        'bang_tan', (ARRAY['Dual-band','Dual-band','Dual-band','Tri-band','Tri-band','Single-band'])[i],
                        'cong_ket_noi', (ARRAY['USB 2.0','USB 3.0','PCIe x1','USB 3.0','PCIe x1','USB 2.0'])[i]);
                WHEN 'pl-usb-flash-drive' THEN
                    v_vspecs := jsonb_build_object(
                        'dung_luong', (ARRAY['32GB','64GB','128GB','256GB','512GB','128GB'])[i],
                        'chuan_ket_noi', (ARRAY['USB 2.0','USB 3.0','USB 3.1','USB 3.2','USB-C','USB 3.0'])[i],
                        'toc_do_doc', (ARRAY['80MB/s','100MB/s','150MB/s','200MB/s','400MB/s','150MB/s'])[i],
                        'chat_lieu_vo', (ARRAY['Nhựa','Nhựa','Kim loại','Kim loại','Kim loại','Nhựa'])[i]);
                ELSE
                    v_vspecs := jsonb_build_object('phien_ban', 'Tiêu chuẩn');
            END CASE;

            -- Chuỗi thông số = các value nối ' / ' theo key (khớp buildChuoiThongSo / V14).
            v_specstr := (SELECT string_agg(value, ' / ' ORDER BY key) FROM jsonb_each_text(v_vspecs));

            INSERT INTO san_pham (
                ten_san_pham, slug, mo_ta, mo_ta_ngan, phan_loai_id, thuong_hieu,
                anh_dai_dien, ban_do_bien_the, nhan_ids,
                diem_danh_gia_tb, so_luot_danh_gia, so_luot_ban, trang_thai, ngay_tao
            ) VALUES (
                v_ten, v_slug,
                v_ten || ' — hàng chính hãng, bảo hành 12 tháng, giao toàn quốc.',
                v_ten || ' chính hãng, bảo hành 12 tháng',
                v_pl_id, v_brand,
                v_img, '{}'::jsonb, '[]'::jsonb,
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

            -- ban_do_bien_the = { chuỗi thông số: { màu: id biến thể } }.
            UPDATE san_pham
            SET ban_do_bien_the = jsonb_build_object(v_specstr, jsonb_build_object(v_color, v_bt_id))
            WHERE id = v_sp_id;
        END LOOP;
    END LOOP;
END $$;
