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
