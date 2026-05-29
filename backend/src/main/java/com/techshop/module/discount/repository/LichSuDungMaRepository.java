package com.techshop.module.discount.repository;

import com.techshop.module.discount.entity.LichSuDungMa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LichSuDungMaRepository extends JpaRepository<LichSuDungMa, Long> {

    boolean existsByMaGiamGiaIdAndNguoiDungId(Long maGiamGiaId, Long nguoiDungId);

    @Modifying
    @Query("DELETE FROM LichSuDungMa l WHERE l.donHangId = :donHangId")
    void deleteByDonHangId(@Param("donHangId") Long donHangId);
}
