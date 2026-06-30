-- ============================================================
-- V3: Seed 2 sản phẩm cho MỖI phân loại ("chọn sản phẩm") đang hiển thị,
--     mỗi sản phẩm có 3 biến thể. ẢNH biến thể để TRỐNG (anh_bien_the_san_pham
--     = NULL, anh_dai_dien = NULL, KHÔNG chèn anh_san_pham) — url ảnh sẽ bổ sung sau.
--
--   Data-driven: thông số biến thể (thong_so_bien_the) lấy đúng ma_thuoc_tinh +
--   giá trị thật của từng phân loại (thuoc_tinh / gia_tri_thuoc_tinh) → card hiển
--   thị thông số và LỌC theo tiêu chí luôn khớp với mọi phân loại, kể cả phân loại
--   thêm sau này. Phân loại không có thuộc tính → fallback {"phien_ban":"Bản N"}.
--
--   - 3 biến thể / sản phẩm phân biệt bằng MÀU (Đen/Trắng/Bạc) + cycle giá trị của
--     thuộc tính đầu tiên → luôn đủ 3 biến thể phân biệt, đều "reachable".
--   - ban_do_bien_the (trên san_pham) = { "<chuỗi thông số>": { "<màu>": <id biến thể> } }
--     (khớp model denormalize V14/V24).
--   - Chỉ seed phân loại HIỂN_THỊ, còn gắn với 1 danh mục đang tồn tại, và đang
--     TRỐNG (chưa có sản phẩm) → không nhân đôi, không đụng phân loại đã có hàng.
-- ============================================================

DO $$
DECLARE
    pl        RECORD;
    v_prod    INT;
    v_j       INT;
    v_attrs   JSONB;
    v_vspecs  JSONB;
    v_specstr TEXT;
    v_color   TEXT;
    v_brand   TEXT;
    v_basegia NUMERIC;
    v_gia     NUMERIC;
    v_km      NUMERIC;
    v_sp_id   BIGINT;
    v_bt_id   BIGINT;
    v_bando   JSONB;
    v_ten     TEXT;
    v_slug    TEXT;
    k         INT;
    idx       INT;
    nvals     INT;
    attr      JSONB;
    vals      JSONB;
    a_colors  TEXT[] := ARRAY['Đen','Trắng','Bạc'];
    a_brands  TEXT[] := ARRAY['ASUS','Logitech','Samsung','Kingston','MSI','Dell','HP','Corsair'];
BEGIN
    FOR pl IN
        SELECT p.id, p.ten_phan_loai
        FROM phan_loai_san_pham p
        JOIN danh_muc d ON d.id = p.danh_muc_id
        WHERE COALESCE(p.trang_thai, 'HIEN_THI') = 'HIEN_THI'
        ORDER BY p.id
    LOOP
        -- Bỏ qua phân loại đã có sản phẩm → không nhân đôi.
        IF (SELECT COUNT(*) FROM san_pham WHERE phan_loai_id = pl.id) > 0 THEN
            CONTINUE;
        END IF;

        -- Lấy thuộc tính lọc thật của phân loại: [ {ma, vals:[...]} , ... ] theo thứ tự.
        SELECT jsonb_agg(jsonb_build_object('ma', s.ma, 'vals', s.vals) ORDER BY s.ord)
        INTO v_attrs
        FROM (
            SELECT tt.ma_thuoc_tinh AS ma, tt.thu_tu_hien_thi AS ord,
                   COALESCE((
                       SELECT jsonb_agg(gt.gia_tri ORDER BY gt.thu_tu_hien_thi, gt.id)
                       FROM gia_tri_thuoc_tinh gt
                       WHERE gt.thuoc_tinh_id = tt.id AND gt.trang_thai = 'ACTIVE'
                   ), '[]'::jsonb) AS vals
            FROM thuoc_tinh tt
            WHERE tt.phan_loai_id = pl.id
              AND tt.trang_thai = 'ACTIVE'
              AND tt.ma_thuoc_tinh IS NOT NULL
        ) s;

        FOR v_prod IN 1..2 LOOP
            v_brand   := a_brands[1 + ((pl.id + v_prod) % array_length(a_brands, 1))];
            v_basegia := 1000000 + ((pl.id * 37 + v_prod * 11) % 40) * 100000;   -- 1.0tr .. 4.9tr
            v_ten     := pl.ten_phan_loai || ' ' || v_brand || ' #' || v_prod;
            v_slug    := 'sp-v3-' || pl.id || '-' || v_prod;
            v_bando   := '{}'::jsonb;

            INSERT INTO san_pham (
                ten_san_pham, slug, mo_ta, mo_ta_ngan, phan_loai_id, thuong_hieu,
                anh_dai_dien, ban_do_bien_the, nhan_ids,
                diem_danh_gia_tb, so_luot_danh_gia, so_luot_ban, trang_thai, ngay_tao
            ) VALUES (
                v_ten, v_slug,
                v_ten || ' — hàng chính hãng, bảo hành 12 tháng, giao toàn quốc.',
                v_ten || ' chính hãng, bảo hành 12 tháng',
                pl.id, v_brand,
                NULL, '{}'::jsonb, '[]'::jsonb,
                0, 0, 0, 'CON_HANG', now()
            ) RETURNING id INTO v_sp_id;

            FOR v_j IN 1..3 LOOP
                v_color := a_colors[v_j];

                -- Dựng thông số biến thể từ thuộc tính thật (thuộc tính đầu tiên đổi
                -- theo biến thể để có khác biệt, các thuộc tính còn lại lấy giá trị đầu).
                v_vspecs := '{}'::jsonb;
                IF v_attrs IS NOT NULL THEN
                    FOR k IN 0 .. (jsonb_array_length(v_attrs) - 1) LOOP
                        attr  := v_attrs -> k;
                        vals  := attr -> 'vals';
                        nvals := jsonb_array_length(vals);
                        IF nvals = 0 THEN CONTINUE; END IF;
                        IF k = 0 THEN idx := (v_j - 1) % nvals; ELSE idx := 0; END IF;
                        v_vspecs := v_vspecs || jsonb_build_object(attr ->> 'ma', vals ->> idx);
                    END LOOP;
                END IF;
                IF v_vspecs = '{}'::jsonb THEN
                    v_vspecs := jsonb_build_object('phien_ban', 'Bản ' || v_j);
                END IF;

                -- Chuỗi thông số = các value nối ' / ' theo key (khớp buildChuoiThongSo).
                v_specstr := (SELECT string_agg(value, ' / ' ORDER BY key)
                              FROM jsonb_each_text(v_vspecs));

                v_gia := v_basegia + (v_j - 1) * 200000;
                IF v_prod = 2 THEN v_km := round(v_gia * 0.9); ELSE v_km := NULL; END IF;

                INSERT INTO bien_the_san_pham (
                    san_pham_id, phan_loai_id, ma_bien_the, ten_bien_the, ten_san_pham, thuong_hieu,
                    mau_sac, thong_so_bien_the, bien_the_gan_nhan, anh_bien_the_san_pham,
                    gia, gia_khuyen_mai, so_luong_ton, so_luot_ban, so_luot_danh_gia,
                    la_bien_the_mac_dinh, trang_thai, ngay_tao, ngay_cap_nhat
                ) VALUES (
                    v_sp_id, pl.id,
                    'BTV3-' || pl.id || '-' || v_prod || '-' || v_j,
                    v_specstr || ' / ' || v_color, v_ten, v_brand,
                    v_color, v_vspecs, '{}'::jsonb, NULL,         -- ẢNH để TRỐNG
                    v_gia, v_km, 25, 0, 0,
                    (v_j = 1), 'CON_HANG', now(), now()
                ) RETURNING id INTO v_bt_id;

                -- ban_do_bien_the = { chuỗi thông số: { màu: id biến thể } }.
                v_bando := jsonb_set(
                    v_bando, ARRAY[v_specstr],
                    COALESCE(v_bando -> v_specstr, '{}'::jsonb) || jsonb_build_object(v_color, v_bt_id),
                    true);
            END LOOP;

            UPDATE san_pham SET ban_do_bien_the = v_bando WHERE id = v_sp_id;
        END LOOP;
    END LOOP;
END $$;
