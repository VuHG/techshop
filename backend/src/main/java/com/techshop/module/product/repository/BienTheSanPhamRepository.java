package com.techshop.module.product.repository;

import com.techshop.module.product.entity.BienTheSanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BienTheSanPhamRepository extends JpaRepository<BienTheSanPham, Long> {

    // Chỉ fetch anhs, nhans sẽ lazy-load trong transaction
    @Query("""
            SELECT bt FROM BienTheSanPham bt
            LEFT JOIN FETCH bt.anhs
            WHERE bt.sanPham.id = :sanPhamId
            ORDER BY bt.gia
            """)
    List<BienTheSanPham> findBySanPhamIdWithDetails(@Param("sanPhamId") Long sanPhamId);

    // Nạp kèm sản phẩm cha để lấy snapshot (tên, slug, sanPhamId) không cần lazy-load thêm.
    @Query("""
            SELECT bt FROM BienTheSanPham bt
            JOIN FETCH bt.sanPham
            WHERE bt.id = :id
            """)
    Optional<BienTheSanPham> findByIdWithSanPham(@Param("id") Long id);

    // Atomic trừ kho: chỉ trừ khi đủ tồn. Trả số dòng cập nhật (1 = OK, 0 = không đủ kho).
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE BienTheSanPham bt SET bt.soLuongTon = bt.soLuongTon - :soLuong
            WHERE bt.id = :id AND bt.soLuongTon >= :soLuong
            """)
    int truTonKho(@Param("id") Long id, @Param("soLuong") int soLuong);

    // Atomic hoàn kho khi hủy đơn.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE BienTheSanPham bt SET bt.soLuongTon = bt.soLuongTon + :soLuong WHERE bt.id = :id")
    int hoanTonKho(@Param("id") Long id, @Param("soLuong") int soLuong);
}
