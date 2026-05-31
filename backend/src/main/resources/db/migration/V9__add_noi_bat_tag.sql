-- ============================================================
-- V9: Nhãn "Nổi bật" + gắn cho một số biến thể
-- Dùng cho khối "Sản phẩm nổi bật" ở trang chủ (chỉ SP gắn tag này mới hiện).
-- ============================================================

INSERT INTO nhan_san_pham (ten_nhan, ma_nhan, mau_sac, thu_tu_hien_thi, trang_thai)
VALUES ('Nổi bật', 'noi-bat', '#2563EB', 10, 'ACTIVE');

-- Gắn nhãn "Nổi bật" cho 12 biến thể (bỏ qua 8 biến thể đầu đang flash sale để đa dạng).
INSERT INTO bien_the_nhan (bien_the_id, nhan_id)
SELECT bt.id, (SELECT id FROM nhan_san_pham WHERE ma_nhan = 'noi-bat')
FROM bien_the_san_pham bt
WHERE bt.trang_thai = 'CON_HANG'
ORDER BY bt.id
LIMIT 12 OFFSET 8
ON CONFLICT (bien_the_id, nhan_id) DO NOTHING;
