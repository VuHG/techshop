package com.techshop.module.dexuat.repository;

import com.techshop.module.dexuat.entity.GiaThiTruong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface GiaThiTruongRepository extends JpaRepository<GiaThiTruong, Long> {

    Optional<GiaThiTruong> findByBienTheId(Long bienTheId);

    /** Bổ sung giá thị trường cho biến thể chưa có (mới thêm sau khi seed). */
    @Modifying
    @Query(value = """
            INSERT INTO gia_thi_truong (bien_the_id, gia_thi_truong, nguon, ngay_cap_nhat)
            SELECT bt.id, GREATEST(ROUND(bt.gia * (0.90 + random() * 0.20) / 1000) * 1000, 1000), 'MOCK', now()
            FROM bien_the_san_pham bt
            WHERE NOT EXISTS (SELECT 1 FROM gia_thi_truong g WHERE g.bien_the_id = bt.id)
            """, nativeQuery = true)
    int themChoBienTheMoi();

    /** Jitter ±2% để mô phỏng thị trường biến động (không dưới 1.000đ). */
    @Modifying
    @Query(value = """
            UPDATE gia_thi_truong
            SET gia_thi_truong = GREATEST(ROUND(gia_thi_truong * (0.98 + random() * 0.04) / 1000) * 1000, 1000),
                ngay_cap_nhat = now()
            """, nativeQuery = true)
    int moPhongBienDong();
}
