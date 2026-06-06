package com.techshop.module.discount.repository;

import com.techshop.module.discount.entity.MaGiamGiaSanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MaGiamGiaSanPhamRepository extends JpaRepository<MaGiamGiaSanPham, Long> {

    @Query("SELECT m.sanPhamId FROM MaGiamGiaSanPham m WHERE m.maGiamGiaId = :maGiamGiaId")
    List<Long> findSanPhamIdsByMaGiamGiaId(@Param("maGiamGiaId") Long maGiamGiaId);

    void deleteByMaGiamGiaId(Long maGiamGiaId);
}
