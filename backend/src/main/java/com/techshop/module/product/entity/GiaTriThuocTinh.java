package com.techshop.module.product.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

/** Giá trị của một thuộc tính (vd thuộc tính RAM → 8GB/16GB/32GB). */
@Entity
@Table(name = "gia_tri_thuoc_tinh")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiaTriThuocTinh {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "thuoc_tinh_id", nullable = false)
    private Long thuocTinhId;

    @Column(name = "gia_tri", nullable = false, length = 100)
    private String giaTri;

    @Column(name = "thu_tu_hien_thi")
    private Integer thuTuHienThi;

    @Column(name = "trang_thai_duyet", length = 20)
    private String trangThaiDuyet;

    @Column(name = "trang_thai", length = 20)
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
