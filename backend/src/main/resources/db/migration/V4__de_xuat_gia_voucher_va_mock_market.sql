-- ============================================================
-- V4: "Đề xuất giá & voucher" (AI/rule-based) cho admin DUYỆT + dữ liệu thị trường giả lập.
--   - gia_thi_truong: giá "đối thủ" mô phỏng (mock market) làm tín hiệu đầu vào.
--   - de_xuat_gia / de_xuat_voucher: đề xuất chờ admin Chấp nhận/Từ chối, tự HET_HAN sau 3 ngày.
--   Engine (@Scheduled) chỉ SINH đề xuất, KHÔNG tự áp. Admin duyệt mới áp dụng.
-- ============================================================

-- ── 1) Giá thị trường giả lập (1 dòng / biến thể) ───────────────────────────
CREATE TABLE gia_thi_truong (
    id              BIGSERIAL PRIMARY KEY,
    bien_the_id     BIGINT NOT NULL UNIQUE REFERENCES bien_the_san_pham(id) ON DELETE CASCADE,
    gia_thi_truong  NUMERIC(15,2) NOT NULL,
    nguon           VARCHAR(100) NOT NULL DEFAULT 'MOCK',
    ngay_cap_nhat   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2) Đề xuất giá cho biến thể ─────────────────────────────────────────────
CREATE TABLE de_xuat_gia (
    id            BIGSERIAL PRIMARY KEY,
    bien_the_id   BIGINT NOT NULL REFERENCES bien_the_san_pham(id) ON DELETE CASCADE,
    gia_cu        NUMERIC(15,2),
    gia_de_xuat   NUMERIC(15,2) NOT NULL,
    ly_do         TEXT NOT NULL,
    trang_thai    VARCHAR(20) NOT NULL DEFAULT 'CHO_DUYET',
    ngay_tao      TIMESTAMPTZ NOT NULL DEFAULT now(),
    ngay_het_han  TIMESTAMPTZ NOT NULL,
    ngay_xu_ly    TIMESTAMPTZ,
    CONSTRAINT chk_de_xuat_gia_tt CHECK (trang_thai IN ('CHO_DUYET','CHAP_NHAN','TU_CHOI','HET_HAN'))
);
CREATE INDEX idx_de_xuat_gia_tt ON de_xuat_gia(trang_thai);

-- ── 3) Đề xuất voucher (theo sản phẩm hoặc theo tổng hóa đơn) ────────────────
CREATE TABLE de_xuat_voucher (
    id                  BIGSERIAL PRIMARY KEY,
    pham_vi             VARCHAR(20) NOT NULL,               -- SAN_PHAM | TONG_HOA_DON
    san_pham_id         BIGINT REFERENCES san_pham(id) ON DELETE CASCADE,
    ten_ma              VARCHAR(150) NOT NULL,
    loai_giam           VARCHAR(20) NOT NULL,               -- PHAN_TRAM | SO_TIEN_CO_DINH
    gia_tri_giam        NUMERIC(15,2) NOT NULL,
    gia_tri_giam_toi_da NUMERIC(15,2),
    dieu_kien_toi_thieu NUMERIC(15,2),
    so_ngay_hieu_luc    INT NOT NULL DEFAULT 7,
    ly_do               TEXT NOT NULL,
    trang_thai          VARCHAR(20) NOT NULL DEFAULT 'CHO_DUYET',
    ngay_tao            TIMESTAMPTZ NOT NULL DEFAULT now(),
    ngay_het_han        TIMESTAMPTZ NOT NULL,
    ngay_xu_ly          TIMESTAMPTZ,
    CONSTRAINT chk_de_xuat_voucher_tt CHECK (trang_thai IN ('CHO_DUYET','CHAP_NHAN','TU_CHOI','HET_HAN')),
    CONSTRAINT chk_de_xuat_voucher_pv CHECK (pham_vi IN ('SAN_PHAM','TONG_HOA_DON'))
);
CREATE INDEX idx_de_xuat_voucher_tt ON de_xuat_voucher(trang_thai);

-- ── 4) Seed giá thị trường ≈ giá hiện tại ±10% (làm tròn nghìn) ─────────────
INSERT INTO gia_thi_truong (bien_the_id, gia_thi_truong, nguon)
SELECT id, GREATEST(ROUND(gia * (0.90 + random() * 0.20) / 1000) * 1000, 1000), 'MOCK'
FROM bien_the_san_pham
ON CONFLICT (bien_the_id) DO NOTHING;
