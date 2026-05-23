-- ============================================================
-- V1: Nhóm 1 — Bảo mật & Người dùng
-- Bảng: vai_tro, nguoi_dung, mat_khau_reset, dia_chi
-- ============================================================

CREATE TABLE vai_tro (
    id              BIGSERIAL PRIMARY KEY,
    ten_vai_tro     VARCHAR(50) NOT NULL UNIQUE,
    ngay_tao        TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE nguoi_dung (
    id              BIGSERIAL PRIMARY KEY,
    ho_ten          VARCHAR(100) NOT NULL,
    so_dien_thoai   VARCHAR(15)  NOT NULL UNIQUE,
    email           VARCHAR(150) UNIQUE,
    ngay_sinh       DATE,
    mat_khau        VARCHAR(255) NOT NULL,
    vai_tro_id      BIGINT NOT NULL REFERENCES vai_tro(id),
    trang_thai      VARCHAR(20)  NOT NULL DEFAULT 'HOAT_DONG',
    otp_xac_thuc    VARCHAR(6),
    otp_het_han     TIMESTAMP WITH TIME ZONE,
    da_xac_thuc     BOOLEAN NOT NULL DEFAULT false,
    ngay_tao        TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat   TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT chk_nguoi_dung_trang_thai
        CHECK (trang_thai IN ('HOAT_DONG', 'BI_KHOA', 'CHO_XAC_THUC'))
);

CREATE TABLE mat_khau_reset (
    id              BIGSERIAL PRIMARY KEY,
    nguoi_dung_id   BIGINT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    otp             VARCHAR(6)  NOT NULL,
    het_han         TIMESTAMP WITH TIME ZONE NOT NULL,
    da_su_dung      BOOLEAN NOT NULL DEFAULT false,
    ngay_tao        TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE dia_chi (
    id                  BIGSERIAL PRIMARY KEY,
    nguoi_dung_id       BIGINT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    ho_ten_nguoi_nhan   VARCHAR(100) NOT NULL,
    so_dien_thoai       VARCHAR(15)  NOT NULL,
    dia_chi_chi_tiet    TEXT         NOT NULL,
    phuong_xa           VARCHAR(100) NOT NULL,
    quan_huyen          VARCHAR(100) NOT NULL,
    tinh_thanh          VARCHAR(100) NOT NULL,
    la_mac_dinh         BOOLEAN NOT NULL DEFAULT false,
    ngay_tao            TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_nguoi_dung_sdt      ON nguoi_dung(so_dien_thoai);
CREATE INDEX idx_nguoi_dung_email    ON nguoi_dung(email);
CREATE INDEX idx_nguoi_dung_vai_tro  ON nguoi_dung(vai_tro_id);
CREATE INDEX idx_mat_khau_reset_user ON mat_khau_reset(nguoi_dung_id);
CREATE INDEX idx_dia_chi_user        ON dia_chi(nguoi_dung_id);
