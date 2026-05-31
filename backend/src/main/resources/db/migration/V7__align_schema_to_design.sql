-- ============================================================
-- V7: Đồng bộ schema DB với thiết kế gốc (dbdiagram.io)
-- Chỉ THÊM cột/ràng buộc còn thiếu (nullable hoặc có DEFAULT) + backfill.
-- KHÔNG rename cột cũ, KHÔNG xóa gì, KHÔNG đổi CHECK trạng-thái-đơn/COD (khóa cứng).
-- Cột mới chưa cần map trong entity Java (ddl-auto=validate bỏ qua cột thừa).
-- ============================================================

-- ─── vai_tro ────────────────────────────────────────────────
ALTER TABLE vai_tro ADD COLUMN ma_vai_tro VARCHAR(50);
UPDATE vai_tro SET ma_vai_tro = ten_vai_tro WHERE ma_vai_tro IS NULL;
ALTER TABLE vai_tro ADD CONSTRAINT uq_vai_tro_ma UNIQUE (ma_vai_tro);

-- ─── nguoi_dung ─────────────────────────────────────────────
ALTER TABLE nguoi_dung ADD COLUMN gioi_tinh          VARCHAR(10);
ALTER TABLE nguoi_dung ADD COLUMN avatar_url         VARCHAR(500);
ALTER TABLE nguoi_dung ADD COLUMN lan_dang_nhap_cuoi TIMESTAMP WITH TIME ZONE;
ALTER TABLE nguoi_dung ADD COLUMN ip_dang_nhap_cuoi  VARCHAR(50);
ALTER TABLE nguoi_dung ADD CONSTRAINT chk_nguoi_dung_gioi_tinh
    CHECK (gioi_tinh IS NULL OR gioi_tinh IN ('NAM', 'NU', 'KHAC'));

-- ─── mat_khau_reset ─────────────────────────────────────────
ALTER TABLE mat_khau_reset ADD COLUMN email VARCHAR(150);
UPDATE mat_khau_reset r SET email = u.email
    FROM nguoi_dung u WHERE r.nguoi_dung_id = u.id AND r.email IS NULL;

-- ─── phan_loai_san_pham ─────────────────────────────────────
ALTER TABLE phan_loai_san_pham ADD COLUMN slug            VARCHAR(100);
ALTER TABLE phan_loai_san_pham ADD COLUMN thu_tu_hien_thi INT DEFAULT 0;
ALTER TABLE phan_loai_san_pham ADD COLUMN trang_thai      VARCHAR(20) DEFAULT 'HIEN_THI';
UPDATE phan_loai_san_pham SET slug = 'pl-' || id WHERE slug IS NULL;
ALTER TABLE phan_loai_san_pham ADD CONSTRAINT uq_phan_loai_slug UNIQUE (slug);

-- ─── chi_tiet_thuoc_tinh_loc (quan hệ 1-1) ──────────────────
ALTER TABLE chi_tiet_thuoc_tinh_loc ADD CONSTRAINT uq_loc_phan_loai UNIQUE (phan_loai_id);

-- ─── thuoc_tinh ─────────────────────────────────────────────
ALTER TABLE thuoc_tinh ADD COLUMN ma_thuoc_tinh    VARCHAR(50);
ALTER TABLE thuoc_tinh ADD COLUMN kieu_du_lieu     VARCHAR(20) DEFAULT 'STRING';
ALTER TABLE thuoc_tinh ADD COLUMN thu_tu_hien_thi  INT DEFAULT 0;
ALTER TABLE thuoc_tinh ADD COLUMN trang_thai_duyet VARCHAR(20) DEFAULT 'APPROVED';
ALTER TABLE thuoc_tinh ADD COLUMN trang_thai       VARCHAR(20) DEFAULT 'ACTIVE';
-- Backfill ma_thuoc_tinh khớp KEY trong thong_so_loc (ram/cpu/gpu/color/storage/screen).
UPDATE thuoc_tinh SET ma_thuoc_tinh = CASE ten_thuoc_tinh
        WHEN 'RAM'            THEN 'ram'
        WHEN 'CPU'            THEN 'cpu'
        WHEN 'Card đồ họa'    THEN 'gpu'
        WHEN 'Màu sắc'        THEN 'color'
        WHEN 'Dung lượng SSD' THEN 'storage'
        WHEN 'Kích thước màn' THEN 'screen'
        ELSE lower(replace(ten_thuoc_tinh, ' ', '_'))
    END
    WHERE ma_thuoc_tinh IS NULL;

-- ─── gia_tri_thuoc_tinh ─────────────────────────────────────
ALTER TABLE gia_tri_thuoc_tinh ADD COLUMN thu_tu_hien_thi  INT DEFAULT 0;
ALTER TABLE gia_tri_thuoc_tinh ADD COLUMN trang_thai_duyet VARCHAR(20) DEFAULT 'APPROVED';
ALTER TABLE gia_tri_thuoc_tinh ADD COLUMN trang_thai       VARCHAR(20) DEFAULT 'ACTIVE';

-- ─── nhan_san_pham ──────────────────────────────────────────
ALTER TABLE nhan_san_pham ADD COLUMN ma_nhan         VARCHAR(50);
ALTER TABLE nhan_san_pham ADD COLUMN thu_tu_hien_thi INT DEFAULT 0;
ALTER TABLE nhan_san_pham ADD COLUMN trang_thai      VARCHAR(20) DEFAULT 'ACTIVE';
UPDATE nhan_san_pham SET ma_nhan = CASE ten_nhan
        WHEN 'Hot'        THEN 'hot'
        WHEN 'Sale'       THEN 'sale'
        WHEN 'Mới về'     THEN 'moi-ve'
        WHEN 'Trả góp 0%' THEN 'tra-gop-0'
        WHEN 'Bán chạy'   THEN 'ban-chay'
        ELSE lower(replace(ten_nhan, ' ', '-'))
    END
    WHERE ma_nhan IS NULL;
ALTER TABLE nhan_san_pham ADD CONSTRAINT uq_nhan_ma UNIQUE (ma_nhan);

-- ─── bien_the_san_pham ──────────────────────────────────────
ALTER TABLE bien_the_san_pham ADD COLUMN phan_loai_id        BIGINT REFERENCES phan_loai_san_pham(id);
ALTER TABLE bien_the_san_pham ADD COLUMN ten_bien_the        VARCHAR(200);
ALTER TABLE bien_the_san_pham ADD COLUMN la_bien_the_mac_dinh BOOLEAN DEFAULT false;
UPDATE bien_the_san_pham bt SET phan_loai_id = sp.phan_loai_id
    FROM san_pham sp WHERE bt.san_pham_id = sp.id AND bt.phan_loai_id IS NULL;
CREATE INDEX idx_bien_the_phan_loai ON bien_the_san_pham(phan_loai_id);

-- ─── chi_tiet_don_hang ──────────────────────────────────────
ALTER TABLE chi_tiet_don_hang ADD COLUMN ten_bien_the       VARCHAR(200);
ALTER TABLE chi_tiet_don_hang ADD COLUMN ma_giam_gia_id     BIGINT REFERENCES ma_giam_gia(id);
ALTER TABLE chi_tiet_don_hang ADD COLUMN tien_giam_san_pham DECIMAL(15,2) DEFAULT 0;
ALTER TABLE chi_tiet_don_hang ALTER COLUMN bien_the_id DROP NOT NULL;

-- ─── don_hang (giữ CHECK pttt = COD; cột thanh toán online để sẵn) ──
ALTER TABLE don_hang ADD COLUMN trang_thai_thanh_toan   VARCHAR(20) DEFAULT 'CHUA_THANH_TOAN';
ALTER TABLE don_hang ADD COLUMN ma_giao_dich_thanh_toan VARCHAR(100);
ALTER TABLE don_hang ADD COLUMN ly_do_huy               TEXT;

-- ─── lich_su_trang_thai_don_hang ────────────────────────────
ALTER TABLE lich_su_trang_thai_don_hang ADD COLUMN trang_thai_cu     VARCHAR(30);
ALTER TABLE lich_su_trang_thai_don_hang ADD COLUMN nguoi_thay_doi_id BIGINT REFERENCES nguoi_dung(id);

-- ─── danh_gia ───────────────────────────────────────────────
ALTER TABLE danh_gia ADD COLUMN bien_the_id      BIGINT REFERENCES bien_the_san_pham(id);
ALTER TABLE danh_gia ADD COLUMN phan_hoi_admin   TEXT;
ALTER TABLE danh_gia ADD COLUMN ngay_phan_hoi    TIMESTAMP WITH TIME ZONE;
ALTER TABLE danh_gia ADD COLUMN nguoi_phan_hoi_id BIGINT REFERENCES nguoi_dung(id);
CREATE INDEX idx_danh_gia_bien_the ON danh_gia(bien_the_id);
ALTER TABLE danh_gia ADD CONSTRAINT uq_danh_gia_user_bt_dh
    UNIQUE (nguoi_dung_id, bien_the_id, don_hang_id);

-- ─── danh_gia_media ─────────────────────────────────────────
ALTER TABLE danh_gia_media ADD COLUMN thu_tu INT DEFAULT 0;

-- ─── thong_bao (mở rộng CHECK loai_thong_bao thêm BAO_MAT) ──
ALTER TABLE thong_bao ADD COLUMN duong_dan_dich VARCHAR(500);
ALTER TABLE thong_bao DROP CONSTRAINT chk_loai_thong_bao;
ALTER TABLE thong_bao ADD CONSTRAINT chk_loai_thong_bao
    CHECK (loai_thong_bao IN ('DON_HANG', 'KHUYEN_MAI', 'HE_THONG', 'BAO_MAT'));

-- ─── ma_giam_gia ────────────────────────────────────────────
ALTER TABLE ma_giam_gia ADD COLUMN mo_ta             TEXT;
ALTER TABLE ma_giam_gia ADD COLUMN loai_ap_dung      VARCHAR(20) DEFAULT 'DON_HANG';
ALTER TABLE ma_giam_gia ADD COLUMN gioi_han_moi_user INT DEFAULT 1;
ALTER TABLE ma_giam_gia ADD CONSTRAINT chk_ma_loai_ap_dung
    CHECK (loai_ap_dung IN ('DON_HANG', 'SAN_PHAM'));

-- ─── phieu_nhap ─────────────────────────────────────────────
ALTER TABLE phieu_nhap ADD COLUMN nha_cung_cap VARCHAR(200);
ALTER TABLE phieu_nhap ADD COLUMN trang_thai   VARCHAR(20) DEFAULT 'APPROVED';
ALTER TABLE phieu_nhap ADD CONSTRAINT chk_phieu_nhap_trang_thai
    CHECK (trang_thai IN ('DRAFT', 'APPROVED', 'CANCELLED'));

-- ─── chi_tiet_phieu_nhap ────────────────────────────────────
ALTER TABLE chi_tiet_phieu_nhap ADD COLUMN thanh_tien DECIMAL(15,2);
UPDATE chi_tiet_phieu_nhap SET thanh_tien = so_luong * gia_nhap WHERE thanh_tien IS NULL;
