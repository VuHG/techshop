package com.techshop.module.cart.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

/**
 * 1 dòng giỏ hàng = 1 user + 1 biến thể (UNIQUE).
 * Lưu bienTheId là Long thuần (không @ManyToOne sang product) để giữ ranh giới module.
 */
@Entity
@Table(name = "gio_hang")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GioHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nguoi_dung_id", nullable = false)
    private Long nguoiDungId;

    @Column(name = "bien_the_id", nullable = false)
    private Long bienTheId;

    @Column(name = "so_luong", nullable = false)
    private int soLuong;

    @Column(name = "ngay_tao", updatable = false)
    private OffsetDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private OffsetDateTime ngayCapNhat;

    @PrePersist
    protected void onCreate() {
        ngayTao = OffsetDateTime.now();
        ngayCapNhat = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        ngayCapNhat = OffsetDateTime.now();
    }
}
