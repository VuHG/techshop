package com.techshop.module.product.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "anh_san_pham")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnhSanPham {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Ảnh chỉ thuộc biến thể (V15: đã bỏ liên kết san_pham). Mỗi biến thể có thể nhiều ảnh.
    @Column(name = "bien_the_id", nullable = false)
    private Long bienTheId;

    @Column(name = "url_anh", nullable = false, length = 500)
    private String urlAnh;

    @Column(name = "la_anh_chinh", nullable = false)
    private boolean laAnhChinh;

    @Column(name = "thu_tu")
    private Integer thuTu;

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
