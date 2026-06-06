package com.techshop.module.product.repository;

import com.techshop.module.product.entity.PhanLoaiSanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PhanLoaiSanPhamRepository extends JpaRepository<PhanLoaiSanPham, Long> {

    @Query("SELECT p FROM PhanLoaiSanPham p JOIN p.danhMuc d WHERE d.slug = :slug ORDER BY p.tenPhanLoai")
    List<PhanLoaiSanPham> findByDanhMucSlug(@Param("slug") String slug);

    @Query("SELECT p FROM PhanLoaiSanPham p JOIN p.danhMuc d WHERE d.id = :danhMucId ORDER BY p.tenPhanLoai")
    List<PhanLoaiSanPham> findByDanhMucId(@Param("danhMucId") Long danhMucId);

    boolean existsByDanhMucId(Long danhMucId);
}
