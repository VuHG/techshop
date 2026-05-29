package com.techshop.module.discount.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "ma_giam_gia")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaGiamGia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_code", nullable = false, unique = true, length = 50)
    private String maCode;

    @Column(name = "ten_ma", nullable = false, length = 100)
    private String tenMa;

    @Column(name = "loai_giam", nullable = false, length = 20)
    private String loaiGiam;   // PHAN_TRAM | SO_TIEN_CO_DINH

    @Column(name = "gia_tri_giam", nullable = false, precision = 15, scale = 2)
    private BigDecimal giaTriGiam;

    @Column(name = "gia_tri_giam_toi_da", precision = 15, scale = 2)
    private BigDecimal giaTriGiamToiDa;

    @Column(name = "dieu_kien_toi_thieu", precision = 15, scale = 2)
    private BigDecimal dieuKienToiThieu;

    @Column(name = "so_luong_toi_da", nullable = false)
    private int soLuongToiDa;

    @Column(name = "so_luong_da_dung", nullable = false)
    private int soLuongDaDung;

    @Column(name = "bat_dau", nullable = false)
    private OffsetDateTime batDau;

    @Column(name = "ket_thuc", nullable = false)
    private OffsetDateTime ketThuc;

    @Column(name = "trang_thai", nullable = false, length = 20)
    private String trangThai;   // HOAT_DONG | HET_HAN | VO_HIEU

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
