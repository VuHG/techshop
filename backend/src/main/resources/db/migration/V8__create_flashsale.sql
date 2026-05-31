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
