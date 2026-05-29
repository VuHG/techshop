package com.techshop.module.discount.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

/**
 * Lịch sử dùng mã: UNIQUE(ma_giam_gia_id, nguoi_dung_id) → 1 user chỉ dùng 1 mã 1 lần.
 */
@Entity
@Table(name = "lich_su_dung_ma")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichSuDungMa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_giam_gia_id", nullable = false)
    private Long maGiamGiaId;

    @Column(name = "nguoi_dung_id", nullable = false)
    private Long nguoiDungId;

    @Column(name = "don_hang_id", nullable = false)
    private Long donHangId;

    @Column(name = "ngay_tao", updatable = false)
    private OffsetDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = OffsetDateTime.now();
    }
}
