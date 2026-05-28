package com.techshop.module.product.repository;

import com.techshop.module.product.entity.BienTheSanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BienTheSanPhamRepository extends JpaRepository<BienTheSanPham, Long> {

    // Chỉ fetch anhs, nhans sẽ lazy-load trong transaction
    @Query("""
            SELECT bt FROM BienTheSanPham bt
            LEFT JOIN FETCH bt.anhs
            WHERE bt.sanPham.id = :sanPhamId
            ORDER BY bt.gia
            """)
    List<BienTheSanPham> findBySanPhamIdWithDetails(@Param("sanPhamId") Long sanPhamId);
}
