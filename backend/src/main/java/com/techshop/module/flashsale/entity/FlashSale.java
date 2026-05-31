package com.techshop.module.flashsale.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Flash Sale gắn vào 1 biến thể. gia_flash_sale là giá CUỐI khi mua
 * (voucher vẫn được giảm thêm trên tổng đơn). Có hiệu lực khi
 * trang_thai='HOAT_DONG' và now nằm trong [thoiGianBatDau, thoiGianKetThuc].
 */
@Entity
@Table(name = "flashsale")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashSale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bien_the_id", nullable = false)
    private Long bienTheId;

    @Column(name = "gia_flash_sale", nullable = false, precision = 15, scale = 2)
    private BigDecimal giaFlashSale;

    @Column(name = "thoi_gian_bat_dau", nullable = false)
    private OffsetDateTime thoiGianBatDau;

    @Column(name = "thoi_gian_ket_thuc", nullable = false)
    private OffsetDateTime thoiGianKetThuc;

    @Column(name = "so_luong_gioi_han")
    private Integer soLuongGioiHan;

    @Column(name = "so_luong_da_ban", nullable = false)
    private Integer soLuongDaBan;

    @Column(name = "trang_thai", nullable = false, length = 20)
    private String trangThai;

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
