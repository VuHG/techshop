package com.techshop.module.product.repository;

import com.techshop.module.product.entity.AnhSanPham;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AnhSanPhamRepository extends JpaRepository<AnhSanPham, Long> {

    // Ảnh đại diện cho 1 biến thể: ưu tiên ảnh gắn trực tiếp với biến thể,
    // sau đó tới ảnh chung của sản phẩm (bien_the_id IS NULL).
    // Trong mỗi nhóm ưu tiên ảnh chính rồi tới thu_tu.
    @Query("""
            SELECT a FROM AnhSanPham a
            WHERE a.bienTheId = :bienTheId
               OR (a.bienTheId IS NULL AND a.sanPhamId = :sanPhamId)
            ORDER BY
                CASE WHEN a.bienTheId = :bienTheId THEN 0 ELSE 1 END,
                a.laAnhChinh DESC,
                a.thuTu ASC
            """)
    List<AnhSanPham> findAnhDaiDien(@Param("bienTheId") Long bienTheId,
                                    @Param("sanPhamId") Long sanPhamId,
                                    Pageable pageable);

    // ─── Admin ───────────────────────────────────────────────────────────
    List<AnhSanPham> findByBienTheIdOrderByThuTuAsc(Long bienTheId);

    void deleteByBienTheId(Long bienTheId);

    void deleteBySanPhamId(Long sanPhamId);

    // Ảnh cấp sản phẩm (không gắn biến thể).
    List<AnhSanPham> findBySanPhamIdAndBienTheIdIsNullOrderByThuTuAsc(Long sanPhamId);

    void deleteBySanPhamIdAndBienTheIdIsNull(Long sanPhamId);
}
