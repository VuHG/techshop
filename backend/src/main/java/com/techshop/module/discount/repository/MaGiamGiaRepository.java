package com.techshop.module.discount.repository;

import com.techshop.module.discount.entity.MaGiamGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MaGiamGiaRepository extends JpaRepository<MaGiamGia, Long> {

    Optional<MaGiamGia> findByMaCode(String maCode);

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
