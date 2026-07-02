package com.techshop.module.dexuat.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/** Giá "đối thủ" giả lập (mock market) — 1 dòng / biến thể, làm tín hiệu đề xuất giá. */
@Entity
@Table(name = "gia_thi_truong")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiaThiTruong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bien_the_id", nullable = false, unique = true)
    private Long bienTheId;

    @Column(name = "gia_thi_truong", nullable = false, precision = 15, scale = 2)
    private BigDecimal giaThiTruong;

    @Column(name = "nguon", nullable = false, length = 100)
    private String nguon;

    @Column(name = "ngay_cap_nhat", nullable = false)
    private OffsetDateTime ngayCapNhat;

    @PrePersist
    @PreUpdate
    protected void touch() {
        ngayCapNhat = OffsetDateTime.now();
    }
}
