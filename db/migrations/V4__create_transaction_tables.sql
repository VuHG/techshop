-- ============================================================
-- V4: Nhóm 6–11 — Giao dịch, Kho
-- Bảng: gio_hang, ma_giam_gia, don_hang, chi_tiet_don_hang,
--        lich_su_trang_thai_don_hang, danh_gia, danh_gia_media,
--        thong_bao, ma_giam_gia_san_pham, lich_su_dung_ma,
--        phieu_nhap, chi_tiet_phieu_nhap
-- Thứ tự tạo theo dependency: ma_giam_gia trước don_hang.
-- ============================================================

-- Nhóm 6: Giỏ hàng
-- 1 hàng = 1 user + 1 variant. Tăng số lượng bằng cách UPDATE so_luong.

CREATE TABLE gio_hang (
    id              BIGSERIAL PRIMARY KEY,
    nguoi_dung_id   BIGINT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    bien_the_id     BIGINT NOT NULL REFERENCES bien_the_san_pham(id),
    so_luong        INT    NOT NULL DEFAULT 1,
    ngay_tao        TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat   TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (nguoi_dung_id, bien_the_id)
);

-- Nhóm 10: Mã giảm giá (tạo trước don_hang để don_hang có thể reference)

CREATE TABLE ma_giam_gia (
    id                      BIGSERIAL PRIMARY KEY,
    ma_code                 VARCHAR(50)  NOT NULL UNIQUE,
    ten_ma                  VARCHAR(100) NOT NULL,
    loai_giam               VARCHAR(20)  NOT NULL,          -- PHAN_TRAM | SO_TIEN_CO_DINH
    gia_tri_giam            DECIMAL(15,2) NOT NULL,
    gia_tri_giam_toi_da     DECIMAL(15,2),                  -- giới hạn tối đa cho loại PHAN_TRAM
    dieu_kien_toi_thieu     DECIMAL(15,2) DEFAULT 0,        -- giá trị đơn tối thiểu để áp dụng
    so_luong_toi_da         INT          NOT NULL,
    so_luong_da_dung        INT          NOT NULL DEFAULT 0, -- cache: cập nhật bằng atomic SQL
    bat_dau                 TIMESTAMP WITH TIME ZONE NOT NULL,
    ket_thuc                TIMESTAMP WITH TIME ZONE NOT NULL,
    trang_thai              VARCHAR(20)  NOT NULL DEFAULT 'HOAT_DONG',
    ngay_tao                TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat           TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT chk_ma_loai_giam  CHECK (loai_giam  IN ('PHAN_TRAM', 'SO_TIEN_CO_DINH')),
    CONSTRAINT chk_ma_trang_thai CHECK (trang_thai IN ('HOAT_DONG', 'HET_HAN', 'VO_HIEU'))
);

-- Nhóm 7: Đơn hàng
-- Mọi thông tin nhận hàng và giá được snapshot tại thời điểm đặt.
-- KHÔNG JOIN lại bảng product/discount để hiển thị lịch sử.

CREATE TABLE don_hang (
    id                          BIGSERIAL PRIMARY KEY,
    ma_don_hang                 VARCHAR(20)  NOT NULL UNIQUE,   -- VD: TK20260523001
    nguoi_dung_id               BIGINT NOT NULL REFERENCES nguoi_dung(id),
    ho_ten_nguoi_nhan           VARCHAR(100) NOT NULL,           -- snapshot
    so_dien_thoai_nhan          VARCHAR(15)  NOT NULL,           -- snapshot
    dia_chi_giao_hang           TEXT         NOT NULL,           -- snapshot (full address string)
    phuong_thuc_thanh_toan      VARCHAR(20)  NOT NULL DEFAULT 'COD',
    trang_thai                  VARCHAR(30)  NOT NULL DEFAULT 'CHO_XU_LY',
    tong_tien_hang              DECIMAL(15,2) NOT NULL,
    tien_giam_gia               DECIMAL(15,2) NOT NULL DEFAULT 0,
    phi_van_chuyen              DECIMAL(15,2) NOT NULL DEFAULT 0,
    tong_thanh_toan             DECIMAL(15,2) NOT NULL,
    ma_giam_gia_id              BIGINT REFERENCES ma_giam_gia(id),
    ghi_chu                     TEXT,
    ngay_tao                    TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat               TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT chk_don_hang_trang_thai CHECK (
        trang_thai IN ('CHO_THANH_TOAN','CHO_XU_LY','DANG_GIAO',
                       'GIAO_THANH_CONG','HOAN_THANH','DA_HUY')
    ),
    CONSTRAINT chk_don_hang_pttt CHECK (phuong_thuc_thanh_toan IN ('COD'))
);

-- Order items: snapshot đầy đủ tại thời điểm mua.
CREATE TABLE chi_tiet_don_hang (
    id                  BIGSERIAL PRIMARY KEY,
    don_hang_id         BIGINT NOT NULL REFERENCES don_hang(id),
    bien_the_id         BIGINT NOT NULL REFERENCES bien_the_san_pham(id),
    ten_san_pham        VARCHAR(200) NOT NULL,    -- snapshot
    thong_so_bien_the   JSONB        NOT NULL,    -- snapshot: {"ram":"16GB","color":"Đen"}
    duong_dan_anh_chinh VARCHAR(500),             -- snapshot
    gia_luc_mua         DECIMAL(15,2) NOT NULL,   -- snapshot
    so_luong            INT          NOT NULL,
    thanh_tien          DECIMAL(15,2) NOT NULL,
    ngay_tao            TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Timeline trạng thái đơn hàng.
CREATE TABLE lich_su_trang_thai_don_hang (
    id          BIGSERIAL PRIMARY KEY,
    don_hang_id BIGINT NOT NULL REFERENCES don_hang(id),
    trang_thai  VARCHAR(30) NOT NULL,
    ghi_chu     TEXT,
    ngay_tao    TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Nhóm 8: Đánh giá
-- Chỉ cho phép đánh giá sau khi đơn hàng đạt trạng thái HOAN_THANH.

CREATE TABLE danh_gia (
    id              BIGSERIAL PRIMARY KEY,
    nguoi_dung_id   BIGINT NOT NULL REFERENCES nguoi_dung(id),
    san_pham_id     BIGINT NOT NULL REFERENCES san_pham(id),
    don_hang_id     BIGINT REFERENCES don_hang(id),    -- để xác minh đã mua
    diem_danh_gia   SMALLINT NOT NULL,
    noi_dung        TEXT,
    trang_thai      VARCHAR(20) NOT NULL DEFAULT 'DA_DUYET',
    ngay_tao        TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat   TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT chk_diem_danh_gia    CHECK (diem_danh_gia BETWEEN 1 AND 5),
    CONSTRAINT chk_danh_gia_tt      CHECK (trang_thai IN ('CHO_DUYET','DA_DUYET','TU_CHOI'))
);

-- Media đính kèm review. MVP text-only nên bảng này chưa dùng,
-- nhưng schema đã sẵn sàng cho Phase 2.
CREATE TABLE danh_gia_media (
    id          BIGSERIAL PRIMARY KEY,
    danh_gia_id BIGINT NOT NULL REFERENCES danh_gia(id) ON DELETE CASCADE,
    url_media   VARCHAR(500) NOT NULL,
    loai_media  VARCHAR(20)  NOT NULL,
    ngay_tao    TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT chk_loai_media CHECK (loai_media IN ('HINH_ANH', 'VIDEO'))
);

-- Nhóm 9: Thông báo

CREATE TABLE thong_bao (
    id              BIGSERIAL PRIMARY KEY,
    nguoi_dung_id   BIGINT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    tieu_de         VARCHAR(200) NOT NULL,
    noi_dung        TEXT         NOT NULL,
    loai_thong_bao  VARCHAR(50)  NOT NULL,
    da_doc          BOOLEAN NOT NULL DEFAULT false,
    tham_chieu_id   BIGINT,    -- ID của đối tượng liên quan (VD: order id)
    ngay_tao        TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat   TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT chk_loai_thong_bao
        CHECK (loai_thong_bao IN ('DON_HANG','KHUYEN_MAI','HE_THONG'))
);

-- Pivot: mã giảm giá áp dụng cho sản phẩm cụ thể.
-- Nếu mã không có hàng trong bảng này → áp dụng cho toàn bộ sản phẩm.
CREATE TABLE ma_giam_gia_san_pham (
    id              BIGSERIAL PRIMARY KEY,
    ma_giam_gia_id  BIGINT NOT NULL REFERENCES ma_giam_gia(id) ON DELETE CASCADE,
    san_pham_id     BIGINT NOT NULL REFERENCES san_pham(id),
    ngay_tao        TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (ma_giam_gia_id, san_pham_id)
);

-- Lịch sử sử dụng mã giảm giá (1 user chỉ dùng 1 mã 1 lần).
CREATE TABLE lich_su_dung_ma (
    id              BIGSERIAL PRIMARY KEY,
    ma_giam_gia_id  BIGINT NOT NULL REFERENCES ma_giam_gia(id),
    nguoi_dung_id   BIGINT NOT NULL REFERENCES nguoi_dung(id),
    don_hang_id     BIGINT NOT NULL REFERENCES don_hang(id),
    ngay_tao        TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (ma_giam_gia_id, nguoi_dung_id)
);

-- Nhóm 11: Kho

CREATE TABLE phieu_nhap (
    id              BIGSERIAL PRIMARY KEY,
    ma_phieu        VARCHAR(20)   NOT NULL UNIQUE,
    tong_tien       DECIMAL(15,2) NOT NULL,
    ghi_chu         TEXT,
    nguoi_tao_id    BIGINT REFERENCES nguoi_dung(id),
    ngay_tao        TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat   TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE chi_tiet_phieu_nhap (
    id              BIGSERIAL PRIMARY KEY,
    phieu_nhap_id   BIGINT NOT NULL REFERENCES phieu_nhap(id),
    bien_the_id     BIGINT NOT NULL REFERENCES bien_the_san_pham(id),
    so_luong        INT           NOT NULL,
    gia_nhap        DECIMAL(15,2) NOT NULL,
    ngay_tao        TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX idx_gio_hang_user         ON gio_hang(nguoi_dung_id);
CREATE INDEX idx_don_hang_user         ON don_hang(nguoi_dung_id);
CREATE INDEX idx_don_hang_trang_thai   ON don_hang(trang_thai);
CREATE INDEX idx_don_hang_ma           ON don_hang(ma_don_hang);
CREATE INDEX idx_chi_tiet_dh           ON chi_tiet_don_hang(don_hang_id);
CREATE INDEX idx_lich_su_dh            ON lich_su_trang_thai_don_hang(don_hang_id);
CREATE INDEX idx_danh_gia_san_pham     ON danh_gia(san_pham_id);
CREATE INDEX idx_danh_gia_user         ON danh_gia(nguoi_dung_id);
CREATE INDEX idx_thong_bao_user        ON thong_bao(nguoi_dung_id);
CREATE INDEX idx_thong_bao_chua_doc    ON thong_bao(nguoi_dung_id, da_doc);
CREATE INDEX idx_ma_giam_gia_code      ON ma_giam_gia(ma_code);
CREATE INDEX idx_ma_giam_gia_tt        ON ma_giam_gia(trang_thai);
CREATE INDEX idx_lich_su_dung_ma       ON lich_su_dung_ma(ma_giam_gia_id, nguoi_dung_id);
CREATE INDEX idx_phieu_nhap_ma         ON phieu_nhap(ma_phieu);
CREATE INDEX idx_chi_tiet_pn           ON chi_tiet_phieu_nhap(phieu_nhap_id);
