-- ============================================================
-- V10: Xóa các danh mục RAM, SSD, Card đồ họa, CPU, Chuột, Bàn phím, Tai nghe
-- cùng phân loại + sản phẩm + biến thể thuộc chúng.
-- Lịch sử đơn hàng được GIỮ (snapshot): chỉ gỡ liên kết bien_the_id.
-- Linh kiện & Phụ kiện (cha) KHÔNG xóa — sẽ rỗng sau migration này.
-- ============================================================

-- 1) Gỡ liên kết biến thể ở chi tiết đơn (giữ snapshot tên/giá/ảnh).
UPDATE chi_tiet_don_hang SET bien_the_id = NULL
WHERE bien_the_id IN (
    SELECT bt.id FROM bien_the_san_pham bt
    JOIN san_pham sp ON bt.san_pham_id = sp.id
    JOIN phan_loai_san_pham pl ON sp.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug IN ('ram','ssd','card-do-hoa','cpu','chuot','ban-phim','tai-nghe')
);

-- 2) Xóa dữ liệu phụ thuộc khác.
DELETE FROM gio_hang WHERE bien_the_id IN (
    SELECT bt.id FROM bien_the_san_pham bt
    JOIN san_pham sp ON bt.san_pham_id = sp.id
    JOIN phan_loai_san_pham pl ON sp.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug IN ('ram','ssd','card-do-hoa','cpu','chuot','ban-phim','tai-nghe')
);

DELETE FROM danh_gia WHERE san_pham_id IN (
    SELECT sp.id FROM san_pham sp
    JOIN phan_loai_san_pham pl ON sp.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug IN ('ram','ssd','card-do-hoa','cpu','chuot','ban-phim','tai-nghe')
);

DELETE FROM chi_tiet_phieu_nhap WHERE bien_the_id IN (
    SELECT bt.id FROM bien_the_san_pham bt
    JOIN san_pham sp ON bt.san_pham_id = sp.id
    JOIN phan_loai_san_pham pl ON sp.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug IN ('ram','ssd','card-do-hoa','cpu','chuot','ban-phim','tai-nghe')
);

DELETE FROM ma_giam_gia_san_pham WHERE san_pham_id IN (
    SELECT sp.id FROM san_pham sp
    JOIN phan_loai_san_pham pl ON sp.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug IN ('ram','ssd','card-do-hoa','cpu','chuot','ban-phim','tai-nghe')
);

-- 3) Xóa biến thể (cascade: bien_the_nhan, bien_the_gia_tri_thuoc_tinh, anh_san_pham, flashsale).
DELETE FROM bien_the_san_pham WHERE san_pham_id IN (
    SELECT sp.id FROM san_pham sp
    JOIN phan_loai_san_pham pl ON sp.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug IN ('ram','ssd','card-do-hoa','cpu','chuot','ban-phim','tai-nghe')
);

-- 4) Xóa sản phẩm (cascade: anh_san_pham theo san_pham_id).
DELETE FROM san_pham WHERE phan_loai_id IN (
    SELECT pl.id FROM phan_loai_san_pham pl
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug IN ('ram','ssd','card-do-hoa','cpu','chuot','ban-phim','tai-nghe')
);

-- 5) Xóa filter schema + thuộc tính + giá trị thuộc tính của các phân loại đó (nếu có).
DELETE FROM chi_tiet_thuoc_tinh_loc WHERE phan_loai_id IN (
    SELECT pl.id FROM phan_loai_san_pham pl
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug IN ('ram','ssd','card-do-hoa','cpu','chuot','ban-phim','tai-nghe')
);

DELETE FROM gia_tri_thuoc_tinh WHERE thuoc_tinh_id IN (
    SELECT t.id FROM thuoc_tinh t
    JOIN phan_loai_san_pham pl ON t.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug IN ('ram','ssd','card-do-hoa','cpu','chuot','ban-phim','tai-nghe')
);

DELETE FROM thuoc_tinh WHERE phan_loai_id IN (
    SELECT pl.id FROM phan_loai_san_pham pl
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug IN ('ram','ssd','card-do-hoa','cpu','chuot','ban-phim','tai-nghe')
);

-- 6) Xóa phân loại.
DELETE FROM phan_loai_san_pham WHERE danh_muc_id IN (
    SELECT id FROM danh_muc
    WHERE slug IN ('ram','ssd','card-do-hoa','cpu','chuot','ban-phim','tai-nghe')
);

-- 7) Xóa danh mục.
DELETE FROM danh_muc WHERE slug IN ('ram','ssd','card-do-hoa','cpu','chuot','ban-phim','tai-nghe');
