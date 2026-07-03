-- ============================================================
-- V7: Gắn nhãn Hot / Nổi bật + seed Flash sale cho một số sản phẩm.
--   (V8/V9 cũ chạy TRƯỚC khi có sản phẩm V3 nên là no-op → trang chủ rỗng.)
--   Trang chủ: "Sản phẩm nổi bật" = getSanPham(nhan='noi-bat') lọc qua bien_the_nhan;
--              "Flash sale" = flashsale đang HOAT_DONG. Badge trên card đọc JSONB
--              denormalized bien_the_gan_nhan = { "<nhan_id>":[ten,mau,thu_tu,trang_thai] }.
--   Chọn biến thể MẶC ĐỊNH, rải theo san_pham_id để đa dạng loại.
-- ============================================================

-- 0) Đảm bảo nhãn hot/noi-bat đang ACTIVE + có thứ tự hiển thị.
UPDATE nhan_san_pham SET trang_thai = 'ACTIVE'
WHERE ma_nhan IN ('hot', 'noi-bat') AND COALESCE(trang_thai, '') <> 'ACTIVE';
UPDATE nhan_san_pham SET thu_tu_hien_thi = 5 WHERE ma_nhan = 'hot' AND thu_tu_hien_thi IS NULL;

-- 1) Gắn nhãn "Nổi bật" (san_pham_id chẵn) và "Hot" (chia hết cho 3) cho biến thể mặc định.
INSERT INTO bien_the_nhan (bien_the_id, nhan_id)
SELECT bt.id, (SELECT id FROM nhan_san_pham WHERE ma_nhan = 'noi-bat')
FROM bien_the_san_pham bt
JOIN san_pham sp ON sp.id = bt.san_pham_id
WHERE bt.la_bien_the_mac_dinh = true AND bt.trang_thai = 'CON_HANG'
  AND sp.trang_thai = 'CON_HANG' AND sp.id % 2 = 0
ON CONFLICT (bien_the_id, nhan_id) DO NOTHING;

INSERT INTO bien_the_nhan (bien_the_id, nhan_id)
SELECT bt.id, (SELECT id FROM nhan_san_pham WHERE ma_nhan = 'hot')
FROM bien_the_san_pham bt
JOIN san_pham sp ON sp.id = bt.san_pham_id
WHERE bt.la_bien_the_mac_dinh = true AND bt.trang_thai = 'CON_HANG'
  AND sp.trang_thai = 'CON_HANG' AND sp.id % 3 = 0
ON CONFLICT (bien_the_id, nhan_id) DO NOTHING;

-- 2) Dựng lại denormalized bien_the_gan_nhan cho các biến thể vừa gắn (chỉ nhãn ACTIVE).
UPDATE bien_the_san_pham bt
SET bien_the_gan_nhan = COALESCE((
        SELECT jsonb_object_agg(
                 n.id::text,
                 jsonb_build_array(n.ten_nhan, n.mau_sac, COALESCE(n.thu_tu_hien_thi, 0), COALESCE(n.trang_thai, 'ACTIVE')))
        FROM bien_the_nhan bn
        JOIN nhan_san_pham n ON n.id = bn.nhan_id
        WHERE bn.bien_the_id = bt.id AND COALESCE(n.trang_thai, 'ACTIVE') = 'ACTIVE'
    ), '{}'::jsonb)
WHERE EXISTS (SELECT 1 FROM bien_the_nhan bn WHERE bn.bien_the_id = bt.id);

-- 3) Flash sale ĐANG DIỄN RA cho biến thể mặc định (san_pham_id chia hết cho 4), giảm ~20%.
INSERT INTO flashsale (bien_the_id, gia_flash_sale, thoi_gian_bat_dau, thoi_gian_ket_thuc,
                       so_luong_gioi_han, so_luong_da_ban, trang_thai)
SELECT bt.id,
       GREATEST(ROUND(COALESCE(bt.gia_khuyen_mai, bt.gia) * 0.8 / 1000) * 1000, 1000),
       now() - interval '1 day', now() + interval '7 day',
       50, 0, 'HOAT_DONG'
FROM bien_the_san_pham bt
JOIN san_pham sp ON sp.id = bt.san_pham_id
WHERE bt.la_bien_the_mac_dinh = true AND bt.trang_thai = 'CON_HANG'
  AND sp.trang_thai = 'CON_HANG' AND sp.id % 4 = 0
  AND NOT EXISTS (SELECT 1 FROM flashsale f WHERE f.bien_the_id = bt.id AND f.trang_thai = 'HOAT_DONG');
