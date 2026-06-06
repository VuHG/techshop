package com.techshop.module.product.repository;

import com.techshop.module.product.entity.DanhMuc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DanhMucRepository extends JpaRepository<DanhMuc, Long> {

    Optional<DanhMuc> findBySlug(String slug);

    @Query("SELECT d FROM DanhMuc d WHERE d.danhMucCha IS NULL AND d.trangThai = 'HIEN_THI' ORDER BY d.thuTuHienThi")
    List<DanhMuc> findRootCategories();

    List<DanhMuc> findByDanhMucChaIdAndTrangThaiOrderByThuTuHienThi(Long parentId, String trangThai);

    // ─── Admin ───────────────────────────────────────────────────────────
    // Toàn bộ danh mục gốc (cả HIEN_THI lẫn AN) cho cây quản trị.
    List<DanhMuc> findByDanhMucChaIsNullOrderByThuTuHienThiAsc();

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    boolean existsByDanhMucChaId(Long danhMucChaId);
}
