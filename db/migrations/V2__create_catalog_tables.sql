-- ============================================================
-- V2: Nhóm 2, 3, 4 — Danh mục, Thuộc tính, Nhãn
-- Bảng: danh_muc, phan_loai_san_pham, chi_tiet_thuoc_tinh_loc,
--        thuoc_tinh, gia_tri_thuoc_tinh, nhan_san_pham
-- ============================================================

-- Nhóm 2: Danh mục & Phân loại

CREATE TABLE danh_muc (
    id              BIGSERIAL PRIMARY KEY,
    ten_danh_muc    VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    danh_muc_cha_id BIGINT REFERENCES danh_muc(id),
    thu_tu_hien_thi INT  DEFAULT 0,
    trang_thai      VARCHAR(20) NOT NULL DEFAULT 'HIEN_THI',
    ngay_tao        TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat   TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT chk_danh_muc_trang_thai CHECK (trang_thai IN ('HIEN_THI', 'AN'))
);

CREATE TABLE phan_loai_san_pham (
    id              BIGSERIAL PRIMARY KEY,
    ten_phan_loai   VARCHAR(100) NOT NULL,
    danh_muc_id     BIGINT NOT NULL REFERENCES danh_muc(id),
    ngay_tao        TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Filter schema pre-computed theo từng phân loại (JSONB).
-- VD: {"ram":["8GB","16GB","32GB"],"cpu":["i5","i7","i9"]}
CREATE TABLE chi_tiet_thuoc_tinh_loc (
    id              BIGSERIAL PRIMARY KEY,
    phan_loai_id    BIGINT NOT NULL REFERENCES phan_loai_san_pham(id),
    thong_so_loc    JSONB  NOT NULL,
    ngay_tao        TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Nhóm 3: Từ điển thuộc tính

CREATE TABLE thuoc_tinh (
    id              BIGSERIAL PRIMARY KEY,
    ten_thuoc_tinh  VARCHAR(100) NOT NULL,
    phan_loai_id    BIGINT NOT NULL REFERENCES phan_loai_san_pham(id),
    ngay_tao        TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE gia_tri_thuoc_tinh (
    id              BIGSERIAL PRIMARY KEY,
    thuoc_tinh_id   BIGINT NOT NULL REFERENCES thuoc_tinh(id),
    gia_tri         VARCHAR(100) NOT NULL,
    ngay_tao        TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Nhóm 4: Nhãn

CREATE TABLE nhan_san_pham (
    id          BIGSERIAL PRIMARY KEY,
    ten_nhan    VARCHAR(50) NOT NULL UNIQUE,
    mau_sac     VARCHAR(7),                 -- hex color, VD: #FF4444
    ngay_tao    TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_danh_muc_cha         ON danh_muc(danh_muc_cha_id);
CREATE INDEX idx_danh_muc_slug        ON danh_muc(slug);
CREATE INDEX idx_phan_loai_danh_muc   ON phan_loai_san_pham(danh_muc_id);
CREATE INDEX idx_chi_tiet_loc_pl      ON chi_tiet_thuoc_tinh_loc(phan_loai_id);
CREATE INDEX idx_chi_tiet_loc_jsonb   ON chi_tiet_thuoc_tinh_loc USING GIN(thong_so_loc);
CREATE INDEX idx_thuoc_tinh_phan_loai ON thuoc_tinh(phan_loai_id);
CREATE INDEX idx_gia_tri_thuoc_tinh   ON gia_tri_thuoc_tinh(thuoc_tinh_id);
