package com.techshop.module.discount.repository;

import com.techshop.module.discount.entity.MaGiamGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MaGiamGiaRepository extends JpaRepository<MaGiamGia, Long> {

    Optional<MaGiamGia> findByMaCode(String maCode);

    boolean existsByMaCode(String maCode);

    boolean existsByMaCodeAndIdNot(String maCode, Long id);

    // Admin: tìm theo mã hoặc tên (chuỗi rỗng = tất cả).
    @Query("""
            SELECT m FROM MaGiamGia m
            WHERE (:search = ''
                   OR LOWER(m.maCode) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(m.tenMa) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY m.ngayTao DESC
            """)
    List<MaGiamGia> timKiemAdmin(@Param("search") String search);

    // Mã giảm giá áp dụng cho một sản phẩm cụ thể (qua bảng ma_giam_gia_san_pham).
    @Query("""
            SELECT m FROM MaGiamGia m
            WHERE m.id IN (SELECT s.maGiamGiaId FROM MaGiamGiaSanPham s WHERE s.sanPhamId = :sanPhamId)
            ORDER BY m.ngayTao DESC
            """)
    List<MaGiamGia> findApDungChoSanPham(@Param("sanPhamId") Long sanPhamId);

    // Atomic tăng lượt dùng: chỉ tăng khi chưa hết lượt. 1 = OK, 0 = hết lượt.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE MaGiamGia m SET m.soLuongDaDung = m.soLuongDaDung + 1
            WHERE m.id = :id AND m.soLuongDaDung < m.soLuongToiDa
            """)
    int tangLuotDung(@Param("id") Long id);

    // Atomic hoàn lượt dùng khi hủy đơn (không âm).
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE MaGiamGia m SET m.soLuongDaDung = m.soLuongDaDung - 1
            WHERE m.id = :id AND m.soLuongDaDung > 0
            """)
    int hoanLuotDung(@Param("id") Long id);
}
