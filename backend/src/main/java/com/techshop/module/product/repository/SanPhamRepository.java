package com.techshop.module.product.repository;

import com.techshop.module.product.entity.SanPham;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface SanPhamRepository extends JpaRepository<SanPham, Long> {

    Optional<SanPham> findBySlugAndTrangThai(String slug, String trangThai);

    // Atomic cập nhật cache field so_luot_ban khi đặt hàng thành công.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE SanPham s SET s.soLuotBan = s.soLuotBan + :soLuong WHERE s.id = :id")
    int tangSoLuotBan(@Param("id") Long id, @Param("soLuong") int soLuong);

    // Cập nhật incremental điểm đánh giá trung bình + tăng số lượt. RHS dùng giá trị cũ của hàng.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE SanPham s
            SET s.diemDanhGiaTb = (COALESCE(s.diemDanhGiaTb, 0) * s.soLuotDanhGia + :diem) / (s.soLuotDanhGia + 1),
                s.soLuotDanhGia = s.soLuotDanhGia + 1
            WHERE s.id = :id
            """)
    int capNhatDiemDanhGia(@Param("id") Long id, @Param("diem") int diem);

    @Query("""
            SELECT DISTINCT s FROM SanPham s
            WHERE s.trangThai = 'CON_HANG'
            AND (:phanLoaiId IS NULL OR s.phanLoaiId = :phanLoaiId)
            AND (:search IS NULL OR LOWER(s.tenSanPham) LIKE :search)
            AND (:minPrice IS NULL OR EXISTS (
                SELECT bt FROM BienTheSanPham bt WHERE bt.sanPham = s
                AND bt.trangThai = 'CON_HANG'
                AND COALESCE(bt.giaKhuyenMai, bt.gia) >= :minPrice))
            AND (:maxPrice IS NULL OR EXISTS (
                SELECT bt FROM BienTheSanPham bt WHERE bt.sanPham = s
                AND bt.trangThai = 'CON_HANG'
                AND COALESCE(bt.giaKhuyenMai, bt.gia) <= :maxPrice))
            """)
    Page<SanPham> findWithFilters(
            @Param("phanLoaiId") Long phanLoaiId,
            @Param("search") String search,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );

    @Query("""
            SELECT s FROM SanPham s
            WHERE s.trangThai = 'CON_HANG'
            AND s.phanLoaiId = :phanLoaiId
            AND s.id NOT IN :excludeIds
            ORDER BY s.soLuotBan DESC
            """)
    List<SanPham> findSimilarProducts(
            @Param("phanLoaiId") Long phanLoaiId,
            @Param("excludeIds") List<Long> excludeIds,
            Pageable pageable
    );

    @Query("""
            SELECT s FROM SanPham s
            WHERE s.trangThai = 'CON_HANG'
            AND LOWER(s.tenSanPham) LIKE LOWER(CONCAT('%', :q, '%'))
            ORDER BY s.soLuotBan DESC
            """)
    List<SanPham> findSuggest(@Param("q") String q, Pageable pageable);

    @Query("SELECT s FROM SanPham s WHERE s.id IN :ids AND s.trangThai = 'CON_HANG'")
    List<SanPham> findByIds(@Param("ids") List<Long> ids);

    @Query("""
            SELECT s FROM SanPham s
            WHERE s.phanLoaiId = :phanLoaiId
            AND s.trangThai = 'CON_HANG'
            AND s.id NOT IN :excludeIds
            ORDER BY s.soLuotBan DESC
            """)
    List<SanPham> findCompareCandidates(
            @Param("phanLoaiId") Long phanLoaiId,
            @Param("excludeIds") List<Long> excludeIds,
            Pageable pageable
    );
}
