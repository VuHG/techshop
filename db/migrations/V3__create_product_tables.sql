-- ============================================================
-- V3: Nhóm 5 — Sản phẩm & Biến thể
-- Bảng: san_pham, bien_the_san_pham, bien_the_gia_tri_thuoc_tinh,
--        bien_the_nhan, anh_san_pham
-- ============================================================

-- san_pham là parent: KHÔNG có giá, KHÔNG có stock, KHÔNG có ảnh trực tiếp.
-- Toàn bộ giá/stock/ảnh gắn vào bien_the_san_pham (child).
CREATE TABLE san_pham (
    id                  BIGSERIAL PRIMARY KEY,
    ten_san_pham        VARCHAR(200) NOT NULL,
    slug                VARCHAR(200) NOT NULL UNIQUE,
    mo_ta               TEXT,
    mo_ta_ngan          VARCHAR(500),
    phan_loai_id        BIGINT NOT NULL REFERENCES phan_loai_san_pham(id),
    thuong_hieu         VARCHAR(100),
    thong_so_ky_thuat   JSONB,           -- thông số chung toàn sản phẩm
    diem_danh_gia_tb    DECIMAL(3,2) DEFAULT 0,   -- cache: cập nhật khi có review mới
    so_luot_danh_gia    INT          DEFAULT 0,   -- cache
    so_luot_ban         INT          DEFAULT 0,   -- cache: cập nhật khi đơn HOAN_THANH
    trang_thai          VARCHAR(20)  NOT NULL DEFAULT 'CON_HANG',
    ngay_tao            TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat       TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT chk_san_pham_trang_thai
        CHECK (trang_thai IN ('CON_HANG', 'HET_HANG', 'NGUNG_BAN', 'BAN_NHAP'))
);

CREATE TABLE bien_the_san_pham (
    id                  BIGSERIAL PRIMARY KEY,
    san_pham_id         BIGINT NOT NULL REFERENCES san_pham(id),
    ma_bien_the         VARCHAR(50) UNIQUE,          -- SKU
    thong_so_bien_the   JSONB NOT NULL,              -- VD: {"ram":"16GB","color":"Đen"}
    gia                 DECIMAL(15,2) NOT NULL,
    gia_khuyen_mai      DECIMAL(15,2),
    so_luong_ton        INT NOT NULL DEFAULT 0,      -- cache: cập nhật khi nhập/xuất kho
    trang_thai          VARCHAR(20) NOT NULL DEFAULT 'CON_HANG',
    ngay_tao            TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat       TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT chk_bien_the_trang_thai
        CHECK (trang_thai IN ('CON_HANG', 'HET_HANG', 'NGUNG_BAN'))
);

-- Pivot: variant ↔ giá trị thuộc tính
CREATE TABLE bien_the_gia_tri_thuoc_tinh (
    id                      BIGSERIAL PRIMARY KEY,
    bien_the_id             BIGINT NOT NULL REFERENCES bien_the_san_pham(id) ON DELETE CASCADE,
    gia_tri_thuoc_tinh_id   BIGINT NOT NULL REFERENCES gia_tri_thuoc_tinh(id),
    ngay_tao                TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (bien_the_id, gia_tri_thuoc_tinh_id)
);

-- Pivot: variant ↔ nhãn (Hot, Sale, Mới về...)
CREATE TABLE bien_the_nhan (
    id          BIGSERIAL PRIMARY KEY,
    bien_the_id BIGINT NOT NULL REFERENCES bien_the_san_pham(id) ON DELETE CASCADE,
    nhan_id     BIGINT NOT NULL REFERENCES nhan_san_pham(id),
    ngay_tao    TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (bien_the_id, nhan_id)
);

-- Ảnh gắn vào variant (đổi variant → đổi gallery hiển thị).
-- bien_the_id NULL = ảnh chung của sản phẩm.
CREATE TABLE anh_san_pham (
    id              BIGSERIAL PRIMARY KEY,
    san_pham_id     BIGINT NOT NULL REFERENCES san_pham(id) ON DELETE CASCADE,
    bien_the_id     BIGINT REFERENCES bien_the_san_pham(id) ON DELETE CASCADE,
    url_anh         VARCHAR(500) NOT NULL,
    la_anh_chinh    BOOLEAN NOT NULL DEFAULT false,
    thu_tu          INT DEFAULT 0,
    ngay_tao        TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_san_pham_phan_loai    ON san_pham(phan_loai_id);
CREATE INDEX idx_san_pham_trang_thai   ON san_pham(trang_thai);
CREATE INDEX idx_san_pham_thuong_hieu  ON san_pham(thuong_hieu);
CREATE INDEX idx_san_pham_slug         ON san_pham(slug);
CREATE INDEX idx_san_pham_ky_thuat     ON san_pham USING GIN(thong_so_ky_thuat);
CREATE INDEX idx_bien_the_san_pham     ON bien_the_san_pham(san_pham_id);
CREATE INDEX idx_bien_the_trang_thai   ON bien_the_san_pham(trang_thai);
CREATE INDEX idx_bien_the_jsonb        ON bien_the_san_pham USING GIN(thong_so_bien_the);
CREATE INDEX idx_anh_san_pham_sp       ON anh_san_pham(san_pham_id);
CREATE INDEX idx_anh_san_pham_bt       ON anh_san_pham(bien_the_id);
