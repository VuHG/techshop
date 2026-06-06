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
