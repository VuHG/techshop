package com.techshop.module.product.repository;

import com.techshop.module.product.entity.SanPham;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SanPhamRepository extends JpaRepository<SanPham, Long> {

    Optional<SanPham> findBySlugAndTrangThai(String slug, String trangThai);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    // ─── Admin: liệt kê mọi sản phẩm (mọi trạng thái) + lọc + tìm kiếm ──────
    // Dùng cờ coDanhMuc/coPhanLoai thay cho ":id IS NULL" để tránh lỗi Postgres
    // "could not determine data type" khi tham số null đứng một mình trong IS NULL.
    @Query("""
            SELECT s FROM SanPham s
            WHERE (:trangThai = '' OR s.trangThai = :trangThai)
              AND (:search = '' OR LOWER(s.tenSanPham) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:coPhanLoai = FALSE OR s.phanLoaiId = :phanLoaiId)
              AND (:coDanhMuc = FALSE OR s.phanLoaiId IN (
                    SELECT p.id FROM PhanLoaiSanPham p WHERE p.danhMuc.id = :danhMucId))
            ORDER BY s.ngayTao DESC
            """)
    Page<SanPham> timKiemAdmin(@Param("trangThai") String trangThai,
                               @Param("search") String search,
                               @Param("coDanhMuc") boolean coDanhMuc,
                               @Param("danhMucId") Long danhMucId,
                               @Param("coPhanLoai") boolean coPhanLoai,
                               @Param("phanLoaiId") Long phanLoaiId,
                               Pageable pageable);

    @Query("SELECT s.trangThai, COUNT(s) FROM SanPham s GROUP BY s.trangThai")
    List<Object[]> demTheoTrangThai();

    long countByPhanLoaiId(Long phanLoaiId);

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

    // Xóa đánh giá: giảm số lượt + đảo ngược điểm trung bình (decremental). 0 lượt → điểm về 0.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE SanPham s
            SET s.diemDanhGiaTb = CASE WHEN s.soLuotDanhGia <= 1 THEN 0
                    ELSE (s.diemDanhGiaTb * s.soLuotDanhGia - :diem) / (s.soLuotDanhGia - 1) END,
                s.soLuotDanhGia = CASE WHEN s.soLuotDanhGia > 0 THEN s.soLuotDanhGia - 1 ELSE 0 END
            WHERE s.id = :id
            """)
    int xoaDanhGia(@Param("id") Long id, @Param("diem") int diem);

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

    // Các lượt sau: chỉ sản phẩm tương quan (cùng phân loại mốc).
    // search = "" → LIKE '%%' khớp tất cả (tránh tham số null gây lỗi suy kiểu của PostgreSQL).
    @Query("""
            SELECT s FROM SanPham s
            WHERE s.trangThai = 'CON_HANG'
            AND s.phanLoaiId = :phanLoaiId
            AND s.id NOT IN :excludeIds
            AND LOWER(s.tenSanPham) LIKE LOWER(CONCAT('%', :search, '%'))
            ORDER BY s.soLuotBan DESC
            """)
    List<SanPham> findCompareCandidates(
            @Param("phanLoaiId") Long phanLoaiId,
            @Param("excludeIds") List<Long> excludeIds,
            @Param("search") String search,
            Pageable pageable
    );

    // Lượt chọn ĐẦU TIÊN: toàn bộ cửa hàng (không lọc phân loại).
    @Query("""
            SELECT s FROM SanPham s
            WHERE s.trangThai = 'CON_HANG'
            AND s.id NOT IN :excludeIds
            AND LOWER(s.tenSanPham) LIKE LOWER(CONCAT('%', :search, '%'))
            ORDER BY s.soLuotBan DESC
            """)
    List<SanPham> findCompareCandidatesAll(
            @Param("excludeIds") List<Long> excludeIds,
            @Param("search") String search,
            Pageable pageable
    );
}
