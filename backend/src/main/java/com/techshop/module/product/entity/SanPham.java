package com.techshop.module.product.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "san_pham")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SanPham {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_san_pham", nullable = false, length = 200)
    private String tenSanPham;

    @Column(name = "slug", nullable = false, unique = true, length = 200)
    private String slug;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "mo_ta_ngan", length = 500)
    private String moTaNgan;

    @Column(name = "phan_loai_id", nullable = false)
    private Long phanLoaiId;

    @Column(name = "thuong_hieu", length = 100)
    private String thuongHieu;

    // Sơ đồ phiên bản: { "<chuỗi thông số>": { "<màu>": <id biến thể> } }.
    // Sản phẩm không còn thông số kỹ thuật chung; cột này thay thế thong_so_ky_thuat (V14).
    @Column(name = "ban_do_bien_the", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> banDoBienThe;

    @Column(name = "diem_danh_gia_tb", precision = 3, scale = 2)
    private BigDecimal diemDanhGiaTb;

    @Column(name = "so_luot_danh_gia")
    private int soLuotDanhGia;

    @Column(name = "so_luot_ban")
    private int soLuotBan;

    @Column(name = "trang_thai", nullable = false, length = 20)
    private String trangThai;

    @OneToMany(mappedBy = "sanPham", fetch = FetchType.LAZY)
    @Builder.Default
    private List<BienTheSanPham> bienThes = new ArrayList<>();

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
