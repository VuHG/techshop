package com.techshop.module.product.repository;

import com.techshop.module.product.entity.AnhSanPham;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AnhSanPhamRepository extends JpaRepository<AnhSanPham, Long> {

    // Ảnh đại diện cho 1 biến thể: ưu tiên ảnh chính rồi tới thu_tu.
    @Query("""
            SELECT a FROM AnhSanPham a
            WHERE a.bienTheId = :bienTheId
            ORDER BY a.laAnhChinh DESC, a.thuTu ASC
            """)
    List<AnhSanPham> findAnhDaiDien(@Param("bienTheId") Long bienTheId, Pageable pageable);

    // ─── Admin ───────────────────────────────────────────────────────────
    List<AnhSanPham> findByBienTheIdOrderByThuTuAsc(Long bienTheId);

    void deleteByBienTheId(Long bienTheId);
}
