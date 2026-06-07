package com.techshop.module.product.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

/** Thuộc tính (thông số) của một phân loại sản phẩm. Nguồn sinh ra filter schema. */
@Entity
@Table(name = "thuoc_tinh")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThuocTinh {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_thuoc_tinh", nullable = false, length = 100)
    private String tenThuocTinh;

    @Column(name = "phan_loai_id", nullable = false)
    private Long phanLoaiId;

    @Column(name = "ma_thuoc_tinh", length = 50)
    private String maThuocTinh;

    @Column(name = "kieu_du_lieu", length = 20)
    private String kieuDuLieu;

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
