package com.techshop.module.discount.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

/**
 * Pivot: mã giảm giá áp dụng cho sản phẩm cụ thể.
 * Nếu 1 mã không có dòng nào ở đây → áp dụng cho toàn bộ sản phẩm.
 */
@Entity
@Table(name = "ma_giam_gia_san_pham")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaGiamGiaSanPham {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_giam_gia_id", nullable = false)
    private Long maGiamGiaId;

    @Column(name = "san_pham_id", nullable = false)
    private Long sanPhamId;

    @Column(name = "ngay_tao", updatable = false)
    private OffsetDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = OffsetDateTime.now();
    }
}
