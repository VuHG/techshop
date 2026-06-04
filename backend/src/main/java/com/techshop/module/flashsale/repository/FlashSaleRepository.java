package com.techshop.module.flashsale.repository;

import com.techshop.module.flashsale.entity.FlashSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface FlashSaleRepository extends JpaRepository<FlashSale, Long> {

    /** Flash sale còn hiệu lực của 1 biến thể (nếu có nhiều, lấy cái kết thúc sớm nhất). */
    @Query("""
            SELECT f FROM FlashSale f
            WHERE f.bienTheId = :bienTheId
            AND f.trangThai = 'HOAT_DONG'
            AND :now BETWEEN f.thoiGianBatDau AND f.thoiGianKetThuc
            ORDER BY f.thoiGianKetThuc ASC
            """)
    List<FlashSale> findConHieuLuc(@Param("bienTheId") Long bienTheId,
                                   @Param("now") OffsetDateTime now);

    default Optional<FlashSale> findConHieuLucDau(Long bienTheId, OffsetDateTime now) {
        return findConHieuLuc(bienTheId, now).stream().findFirst();
    }

    /** Flash sale còn hiệu lực cho NHIỀU biến thể trong 1 truy vấn (tránh N+1 ở listing). */
    @Query("""
            SELECT f FROM FlashSale f
            WHERE f.bienTheId IN :bienTheIds
            AND f.trangThai = 'HOAT_DONG'
            AND :now BETWEEN f.thoiGianBatDau AND f.thoiGianKetThuc
            ORDER BY f.thoiGianKetThuc ASC
            """)
    List<FlashSale> findConHieuLucNhieu(@Param("bienTheIds") List<Long> bienTheIds,
                                        @Param("now") OffsetDateTime now);

    /** Tất cả flash sale đang diễn ra (cho trang chủ). */
    @Query("""
            SELECT f FROM FlashSale f
            WHERE f.trangThai = 'HOAT_DONG'
            AND :now BETWEEN f.thoiGianBatDau AND f.thoiGianKetThuc
            ORDER BY f.thoiGianKetThuc ASC
            """)
    List<FlashSale> findTatCaDangDienRa(@Param("now") OffsetDateTime now);
}
