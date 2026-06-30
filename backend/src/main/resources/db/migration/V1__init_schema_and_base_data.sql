-- ============================================================
-- V1: SCHEMA NỀN + DỮ LIỆU KHỞI TẠO (gộp từ V1..V13 cũ, giữ nguyên thứ tự)
--   Tạo bảng auth/catalog/product/transaction, seed gốc, align schema,
--   flashsale, tinh chỉnh danh mục, tài khoản admin.
-- (Gộp file để gọn — nội dung & thứ tự thực thi giữ nguyên 100%.)
-- ============================================================


-- ┌──────────────── [V1__create_auth_tables.sql] ────────────────

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

-- ┌──────────────── [V2__create_catalog_tables.sql] ────────────────

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

-- ┌──────────────── [V3__create_product_tables.sql] ────────────────

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

-- ┌──────────────── [V4__create_transaction_tables.sql] ────────────────

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

-- ┌──────────────── [V5__seed_data.sql] ────────────────

-- ============================================================
-- V5: Seed Data
-- Dữ liệu khởi tạo: vai trò, danh mục, phân loại, thuộc tính,
--                   nhãn, 1 sản phẩm mẫu với 2 biến thể
-- ============================================================

-- ============================================================
-- 1. Vai trò
-- ============================================================

INSERT INTO vai_tro (ten_vai_tro) VALUES
    ('CUSTOMER'),
    ('ADMIN');

-- ============================================================
-- 2. Danh mục (cấp 1: cha | cấp 2: con)
-- ============================================================

INSERT INTO danh_muc (ten_danh_muc, slug, danh_muc_cha_id, thu_tu_hien_thi) VALUES
    ('Laptop',          'laptop',       NULL, 1),
    ('PC Gaming',       'pc-gaming',    NULL, 2),
    ('Màn hình',        'man-hinh',     NULL, 3),
    ('Linh kiện',       'linh-kien',    NULL, 4),
    ('Phụ kiện',        'phu-kien',     NULL, 5);

-- Danh mục con của Linh kiện (id=4)
INSERT INTO danh_muc (ten_danh_muc, slug, danh_muc_cha_id, thu_tu_hien_thi) VALUES
    ('RAM',     'ram',  4, 1),
    ('SSD',     'ssd',  4, 2),
    ('Card đồ họa', 'card-do-hoa', 4, 3),
    ('CPU',     'cpu',  4, 4);

-- Danh mục con của Phụ kiện (id=5)
INSERT INTO danh_muc (ten_danh_muc, slug, danh_muc_cha_id, thu_tu_hien_thi) VALUES
    ('Chuột',       'chuot',        5, 1),
    ('Bàn phím',    'ban-phim',     5, 2),
    ('Tai nghe',    'tai-nghe',     5, 3);

-- ============================================================
-- 3. Phân loại sản phẩm
-- ============================================================

INSERT INTO phan_loai_san_pham (ten_phan_loai, danh_muc_id) VALUES
    ('Laptop',      1),   -- id=1
    ('PC Gaming',   2),   -- id=2
    ('Màn hình',    3),   -- id=3
    ('RAM',         6),   -- id=4  (danh_muc slug='ram')
    ('SSD',         7),   -- id=5  (danh_muc slug='ssd')
    ('Card đồ họa', 8),   -- id=6
    ('CPU',         9),   -- id=7
    ('Chuột',       10),  -- id=8
    ('Bàn phím',    11);  -- id=9

-- ============================================================
-- 4. Thuộc tính cho phân loại Laptop (id=1)
-- ============================================================

INSERT INTO thuoc_tinh (ten_thuoc_tinh, phan_loai_id) VALUES
    ('RAM',             1),   -- id=1
    ('CPU',             1),   -- id=2
    ('Card đồ họa',     1),   -- id=3
    ('Màu sắc',         1),   -- id=4
    ('Dung lượng SSD',  1),   -- id=5
    ('Kích thước màn',  1);   -- id=6

-- Giá trị cho RAM (thuoc_tinh id=1)
INSERT INTO gia_tri_thuoc_tinh (thuoc_tinh_id, gia_tri) VALUES
    (1, '8GB'),
    (1, '16GB'),
    (1, '32GB'),
    (1, '64GB');

-- Giá trị cho CPU (thuoc_tinh id=2)
INSERT INTO gia_tri_thuoc_tinh (thuoc_tinh_id, gia_tri) VALUES
    (2, 'Intel Core i5'),
    (2, 'Intel Core i7'),
    (2, 'Intel Core i9'),
    (2, 'AMD Ryzen 5'),
    (2, 'AMD Ryzen 7'),
    (2, 'AMD Ryzen 9');

-- Giá trị cho Card đồ họa (thuoc_tinh id=3)
INSERT INTO gia_tri_thuoc_tinh (thuoc_tinh_id, gia_tri) VALUES
    (3, 'Intel UHD Graphics'),
    (3, 'NVIDIA RTX 3050'),
    (3, 'NVIDIA RTX 3060'),
    (3, 'NVIDIA RTX 4060'),
    (3, 'NVIDIA RTX 4070');

-- Giá trị cho Màu sắc (thuoc_tinh id=4)
INSERT INTO gia_tri_thuoc_tinh (thuoc_tinh_id, gia_tri) VALUES
    (4, 'Đen'),
    (4, 'Bạc'),
    (4, 'Xanh'),
    (4, 'Trắng');

-- Giá trị cho Dung lượng SSD (thuoc_tinh id=5)
INSERT INTO gia_tri_thuoc_tinh (thuoc_tinh_id, gia_tri) VALUES
    (5, '256GB'),
    (5, '512GB'),
    (5, '1TB'),
    (5, '2TB');

-- Giá trị cho Kích thước màn (thuoc_tinh id=6)
INSERT INTO gia_tri_thuoc_tinh (thuoc_tinh_id, gia_tri) VALUES
    (6, '13.3 inch'),
    (6, '14 inch'),
    (6, '15.6 inch'),
    (6, '16 inch');

-- ============================================================
-- 5. Nhãn sản phẩm
-- ============================================================

INSERT INTO nhan_san_pham (ten_nhan, mau_sac) VALUES
    ('Hot',         '#FF4444'),
    ('Sale',        '#FF8800'),
    ('Mới về',      '#00AA44'),
    ('Trả góp 0%',  '#0066CC'),
    ('Bán chạy',    '#9900CC');

-- ============================================================
-- 6. Filter schema cho phân loại Laptop
-- ============================================================

INSERT INTO chi_tiet_thuoc_tinh_loc (phan_loai_id, thong_so_loc) VALUES
(1, '{
    "ram":      {"label": "RAM",            "values": ["8GB","16GB","32GB","64GB"]},
    "cpu":      {"label": "CPU",            "values": ["Intel Core i5","Intel Core i7","Intel Core i9","AMD Ryzen 5","AMD Ryzen 7"]},
    "gpu":      {"label": "Card đồ họa",    "values": ["Intel UHD Graphics","NVIDIA RTX 3050","NVIDIA RTX 3060","NVIDIA RTX 4060","NVIDIA RTX 4070"]},
    "storage":  {"label": "Ổ cứng",         "values": ["256GB","512GB","1TB","2TB"]},
    "screen":   {"label": "Màn hình",       "values": ["13.3 inch","14 inch","15.6 inch","16 inch"]},
    "color":    {"label": "Màu sắc",        "values": ["Đen","Bạc","Xanh","Trắng"]}
}');


-- ============================================================
-- 8. Mã giảm giá mẫu
-- ============================================================

INSERT INTO ma_giam_gia (
    ma_code, ten_ma, loai_giam, gia_tri_giam, gia_tri_giam_toi_da,
    dieu_kien_toi_thieu, so_luong_toi_da, bat_dau, ket_thuc, trang_thai
) VALUES (
    'TECHSHOP10',
    'Giảm 10% cho đơn từ 5 triệu',
    'PHAN_TRAM',
    10,             -- 10%
    500000,         -- giảm tối đa 500k
    5000000,        -- đơn tối thiểu 5 triệu
    100,
    now(),
    now() + INTERVAL '30 days',
    'HOAT_DONG'
),
(
    'WELCOME50K',
    'Giảm 50k cho đơn đầu tiên',
    'SO_TIEN_CO_DINH',
    50000,          -- 50.000đ
    NULL,
    0,
    200,
    now(),
    now() + INTERVAL '90 days',
    'HOAT_DONG'
);

-- ┌──────────────── [V7__align_schema_to_design.sql] ────────────────

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

-- ┌──────────────── [V8__create_flashsale.sql] ────────────────

-- ============================================================
-- V8: Bảng Flash Sale (liên kết bien_the_san_pham)
-- gia_flash_sale = giá CUỐI khi mua (voucher vẫn giảm thêm trên tổng đơn).
-- ============================================================

CREATE TABLE flashsale (
    id                  BIGSERIAL PRIMARY KEY,
    bien_the_id         BIGINT NOT NULL REFERENCES bien_the_san_pham(id) ON DELETE CASCADE,
    gia_flash_sale      DECIMAL(15,2) NOT NULL,
    thoi_gian_bat_dau   TIMESTAMP WITH TIME ZONE NOT NULL,
    thoi_gian_ket_thuc  TIMESTAMP WITH TIME ZONE NOT NULL,
    so_luong_gioi_han   INT,                         -- null = không giới hạn
    so_luong_da_ban     INT NOT NULL DEFAULT 0,
    trang_thai          VARCHAR(20) NOT NULL DEFAULT 'HOAT_DONG',
    ngay_tao            TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ngay_cap_nhat       TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT chk_flashsale_trang_thai CHECK (trang_thai IN ('HOAT_DONG', 'KET_THUC', 'VO_HIEU'))
);

CREATE INDEX idx_flashsale_bien_the ON flashsale(bien_the_id);
CREATE INDEX idx_flashsale_thoi_gian ON flashsale(thoi_gian_bat_dau, thoi_gian_ket_thuc);

-- Seed: 8 biến thể đầu vào flash sale đang diễn ra (giá = 80% giá hiệu lực hiện tại).
INSERT INTO flashsale (bien_the_id, gia_flash_sale, thoi_gian_bat_dau, thoi_gian_ket_thuc,
                       so_luong_gioi_han, so_luong_da_ban, trang_thai)
SELECT bt.id,
       ROUND(COALESCE(bt.gia_khuyen_mai, bt.gia) * 0.8, 0),
       now() - interval '2 hour',
       now() + interval '2 day',
       50,
       (bt.id * 7) % 40,
       'HOAT_DONG'
FROM bien_the_san_pham bt
WHERE bt.trang_thai = 'CON_HANG'
ORDER BY bt.id
LIMIT 8;

-- ┌──────────────── [V9__add_noi_bat_tag.sql] ────────────────

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

-- ┌──────────────── [V10__delete_component_categories.sql] ────────────────

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

-- ┌──────────────── [V11__adjust_categories.sql] ────────────────

-- ============================================================
-- V11: Tinh chỉnh danh mục
--   1) Đổi tên "PC Gaming" -> "PC" (GIỮ slug 'pc-gaming' để không phá link FE)
--   2) Xóa danh mục "Màn hình" + sản phẩm/biến thể liên quan (giữ snapshot đơn hàng)
--   3) Thêm phân loại cho "Linh kiện"
--   4) Thêm phân loại cho "Phụ kiện"
-- ============================================================

-- ── 1) Đổi tên PC Gaming -> PC ─────────────────────────────
UPDATE danh_muc
SET ten_danh_muc = 'PC', ngay_cap_nhat = now()
WHERE slug = 'pc-gaming';

-- ── 2) Xóa danh mục "Màn hình" (slug 'man-hinh') ───────────
-- Gỡ liên kết biến thể ở chi tiết đơn (giữ snapshot tên/giá/ảnh).
UPDATE chi_tiet_don_hang SET bien_the_id = NULL
WHERE bien_the_id IN (
    SELECT bt.id FROM bien_the_san_pham bt
    JOIN san_pham sp ON bt.san_pham_id = sp.id
    JOIN phan_loai_san_pham pl ON sp.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'man-hinh'
);

DELETE FROM gio_hang WHERE bien_the_id IN (
    SELECT bt.id FROM bien_the_san_pham bt
    JOIN san_pham sp ON bt.san_pham_id = sp.id
    JOIN phan_loai_san_pham pl ON sp.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'man-hinh'
);

DELETE FROM danh_gia WHERE san_pham_id IN (
    SELECT sp.id FROM san_pham sp
    JOIN phan_loai_san_pham pl ON sp.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'man-hinh'
);

DELETE FROM chi_tiet_phieu_nhap WHERE bien_the_id IN (
    SELECT bt.id FROM bien_the_san_pham bt
    JOIN san_pham sp ON bt.san_pham_id = sp.id
    JOIN phan_loai_san_pham pl ON sp.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'man-hinh'
);

DELETE FROM ma_giam_gia_san_pham WHERE san_pham_id IN (
    SELECT sp.id FROM san_pham sp
    JOIN phan_loai_san_pham pl ON sp.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'man-hinh'
);

-- Xóa biến thể (cascade: bien_the_nhan, bien_the_gia_tri_thuoc_tinh, anh_san_pham, flashsale).
DELETE FROM bien_the_san_pham WHERE san_pham_id IN (
    SELECT sp.id FROM san_pham sp
    JOIN phan_loai_san_pham pl ON sp.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'man-hinh'
);

-- Xóa sản phẩm.
DELETE FROM san_pham WHERE phan_loai_id IN (
    SELECT pl.id FROM phan_loai_san_pham pl
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'man-hinh'
);

-- Xóa filter schema + thuộc tính + giá trị thuộc tính của phân loại đó.
DELETE FROM chi_tiet_thuoc_tinh_loc WHERE phan_loai_id IN (
    SELECT pl.id FROM phan_loai_san_pham pl
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'man-hinh'
);

DELETE FROM gia_tri_thuoc_tinh WHERE thuoc_tinh_id IN (
    SELECT t.id FROM thuoc_tinh t
    JOIN phan_loai_san_pham pl ON t.phan_loai_id = pl.id
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'man-hinh'
);

DELETE FROM thuoc_tinh WHERE phan_loai_id IN (
    SELECT pl.id FROM phan_loai_san_pham pl
    JOIN danh_muc dm ON pl.danh_muc_id = dm.id
    WHERE dm.slug = 'man-hinh'
);

-- Xóa phân loại rồi danh mục.
DELETE FROM phan_loai_san_pham WHERE danh_muc_id IN (
    SELECT id FROM danh_muc WHERE slug = 'man-hinh'
);

DELETE FROM danh_muc WHERE slug = 'man-hinh';

-- ── 3) Thêm phân loại cho "Linh kiện" ──────────────────────
INSERT INTO phan_loai_san_pham (ten_phan_loai, danh_muc_id, slug, thu_tu_hien_thi, trang_thai)
SELECT v.ten, dm.id, v.slug, v.thu_tu, 'HIEN_THI'
FROM danh_muc dm
CROSS JOIN (VALUES
    ('Ram',             'pl-ram',            1),
    ('Ổ cứng SSD',      'pl-o-cung-ssd',     2),
    ('Ổ cứng HHD',      'pl-o-cung-hhd',     3),
    ('Sạc pin laptop',  'pl-sac-pin-laptop', 4),
    ('Màn hình rời',    'pl-man-hinh-roi',   5)
) AS v(ten, slug, thu_tu)
WHERE dm.slug = 'linh-kien';

-- ── 4) Thêm phân loại cho "Phụ kiện" ───────────────────────
INSERT INTO phan_loai_san_pham (ten_phan_loai, danh_muc_id, slug, thu_tu_hien_thi, trang_thai)
SELECT v.ten, dm.id, v.slug, v.thu_tu, 'HIEN_THI'
FROM danh_muc dm
CROSS JOIN (VALUES
    ('Chuột',                       'pl-chuot',                     1),
    ('Bàn phím',                    'pl-ban-phim',                  2),
    ('Lót chuột',                   'pl-lot-chuot',                 3),
    ('Tai nghe',                    'pl-tai-nghe',                  4),
    ('Loa',                         'pl-loa',                       5),
    ('Webcam rời',                  'pl-webcam-roi',                6),
    ('Hub USB',                     'pl-hub-usb',                   7),
    ('Bộ thu phát Wifi/Bluetooh',   'pl-bo-thu-phat-wifi-bluetooth',8),
    ('USB Flash Drive',             'pl-usb-flash-drive',           9)
) AS v(ten, slug, thu_tu)
WHERE dm.slug = 'phu-kien';

-- ┌──────────────── [V12__add_pc_attributes.sql] ────────────────

-- ============================================================
-- V12: Thêm thuộc tính + giá trị cho phân loại "PC Gaming"
--      (phân loại nằm trong danh mục slug 'pc-gaming', nay hiển thị tên "PC").
--      Thuộc tính: CPU, Mainboard, VGA, RAM, Nguồn máy tính (PSU).
-- ============================================================

-- ── 5 thuộc tính ───────────────────────────────────────────
INSERT INTO thuoc_tinh (ten_thuoc_tinh, phan_loai_id, ma_thuoc_tinh, kieu_du_lieu, thu_tu_hien_thi, trang_thai_duyet, trang_thai)
SELECT v.ten, pl.id, v.ma, 'STRING', v.thu_tu, 'APPROVED', 'ACTIVE'
FROM phan_loai_san_pham pl
JOIN danh_muc dm ON pl.danh_muc_id = dm.id
CROSS JOIN (VALUES
    ('CPU',                  'cpu',       1),
    ('Mainboard',            'mainboard', 2),
    ('VGA',                  'vga',       3),
    ('RAM',                  'ram',       4),
    ('Nguồn máy tính (PSU)', 'psu',       5)
) AS v(ten, ma, thu_tu)
WHERE dm.slug = 'pc-gaming';

-- ── Giá trị cho từng thuộc tính (≥4 mỗi thuộc tính) ────────
-- Khớp giá trị với thuộc tính vừa thêm theo (phân loại pc-gaming + tên thuộc tính).
INSERT INTO gia_tri_thuoc_tinh (thuoc_tinh_id, gia_tri, thu_tu_hien_thi, trang_thai_duyet, trang_thai)
SELECT tt.id, v.gia_tri, v.thu_tu, 'APPROVED', 'ACTIVE'
FROM thuoc_tinh tt
JOIN phan_loai_san_pham pl ON tt.phan_loai_id = pl.id
JOIN danh_muc dm ON pl.danh_muc_id = dm.id
CROSS JOIN (VALUES
    -- CPU
    ('CPU', 'Intel Core i5',        1),
    ('CPU', 'Intel Core i7',        2),
    ('CPU', 'Intel Core i9',        3),
    ('CPU', 'AMD Ryzen 5',          4),
    ('CPU', 'AMD Ryzen 7',          5),
    ('CPU', 'AMD Ryzen 9',          6),
    -- Mainboard
    ('Mainboard', 'ASUS B760',      1),
    ('Mainboard', 'MSI B650',       2),
    ('Mainboard', 'Gigabyte Z790',  3),
    ('Mainboard', 'ASRock X670E',   4),
    -- VGA
    ('VGA', 'NVIDIA RTX 4060',      1),
    ('VGA', 'NVIDIA RTX 4070',      2),
    ('VGA', 'NVIDIA RTX 4080',      3),
    ('VGA', 'AMD Radeon RX 7600',   4),
    ('VGA', 'AMD Radeon RX 7800 XT',5),
    -- RAM
    ('RAM', '8GB',                  1),
    ('RAM', '16GB',                 2),
    ('RAM', '32GB',                 3),
    ('RAM', '64GB',                 4),
    -- Nguồn máy tính (PSU)
    ('Nguồn máy tính (PSU)', '550W',  1),
    ('Nguồn máy tính (PSU)', '650W',  2),
    ('Nguồn máy tính (PSU)', '750W',  3),
    ('Nguồn máy tính (PSU)', '850W',  4),
    ('Nguồn máy tính (PSU)', '1000W', 5)
) AS v(ten_thuoc_tinh, gia_tri, thu_tu)
WHERE dm.slug = 'pc-gaming' AND tt.ten_thuoc_tinh = v.ten_thuoc_tinh;

-- ┌──────────────── [V13__admin_setup.sql] ────────────────

-- ============================================================
-- V13: Chuẩn bị cho Role Admin (đợt 1)
-- 1. Thêm trạng thái đơn DA_DUYET ("Chờ lấy hàng") vào CHECK của don_hang.
--    Tài khoản admin được seed bằng AdminSeeder (Java) để mật khẩu khớp
--    BCryptPasswordEncoder của ứng dụng — không hardcode hash trong SQL.
-- ============================================================

ALTER TABLE don_hang DROP CONSTRAINT IF EXISTS chk_don_hang_trang_thai;

ALTER TABLE don_hang ADD CONSTRAINT chk_don_hang_trang_thai CHECK (
    trang_thai IN ('CHO_THANH_TOAN','CHO_XU_LY','DA_DUYET','DANG_GIAO',
                   'GIAO_THANH_CONG','HOAN_THANH','DA_HUY')
);
