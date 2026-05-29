package com.techshop.module.order.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

/** Timeline trạng thái đơn hàng. */
@Entity
@Table(name = "lich_su_trang_thai_don_hang")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichSuTrangThaiDonHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "don_hang_id", nullable = false)
    private DonHang donHang;

    @Column(name = "trang_thai", nullable = false, length = 30)
    private String trangThai;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @Column(name = "ngay_tao", updatable = false)
    private OffsetDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = OffsetDateTime.now();
    }
}
