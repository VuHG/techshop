package com.techshop.module.review.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

/** Ảnh/video minh họa của 1 đánh giá (1 đánh giá có thể nhiều media). */
@Entity
@Table(name = "danh_gia_media")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DanhGiaMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "danh_gia_id", nullable = false)
    private Long danhGiaId;

    @Column(name = "url_media", nullable = false, length = 500)
    private String urlMedia;

    @Column(name = "loai_media", nullable = false, length = 20)
    private String loaiMedia;   // HINH_ANH | VIDEO

    @Column(name = "thu_tu")
    private Integer thuTu;

    @Column(name = "ngay_tao", updatable = false)
    private OffsetDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = OffsetDateTime.now();
    }
}
