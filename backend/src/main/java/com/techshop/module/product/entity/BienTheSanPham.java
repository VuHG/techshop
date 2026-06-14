package com.techshop.module.product.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Entity
@Table(name = "bien_the_san_pham")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BienTheSanPham {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "san_pham_id", nullable = false)
    private SanPham sanPham;

    @Column(name = "ma_bien_the", unique = true, length = 50)
    private String maBienThe;

    @Column(name = "ten_bien_the", length = 200)
    private String tenBienThe;

    // Denormalize từ san_pham (hệ thống tự điền/đồng bộ, admin không nhập tay).
    // Để product card đọc 1 bảng bien_the_san_pham, không JOIN san_pham.
    @Column(name = "ten_san_pham", length = 255)
    private String tenSanPham;

    @Column(name = "thuong_hieu", length = 100)
    private String thuongHieu;

    @Column(name = "mau_sac", length = 50)
    private String mauSac;

    @Column(name = "so_luot_ban", nullable = false)
    private int soLuotBan;

    @Column(name = "phan_loai_id")
    private Long phanLoaiId;

    @Column(name = "la_bien_the_mac_dinh")
    private Boolean laBienTheMacDinh;

    @Column(name = "thong_so_bien_the", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> thongSoBienThe;

    // Denormalize nhãn (hệ thống tự dựng từ bien_the_nhan + nhan_san_pham) để card đọc 1 bảng.
    // { "<nhan_id>": [ten_nhan, mau_sac, thu_tu_hien_thi, trang_thai] }
    @Column(name = "bien_the_gan_nhan", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> bienTheGanNhan;

    @Column(name = "gia", nullable = false, precision = 15, scale = 2)
    private BigDecimal gia;

    @Column(name = "gia_khuyen_mai", precision = 15, scale = 2)
    private BigDecimal giaKhuyenMai;

    @Column(name = "so_luong_ton", nullable = false)
    private int soLuongTon;

    @Column(name = "so_luot_danh_gia", nullable = false)
    private int soLuotDanhGia;

    @Column(name = "trang_thai", nullable = false, length = 20)
    private String trangThai;

    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "bien_the_id", referencedColumnName = "id")
    @Builder.Default
    private List<AnhSanPham> anhs = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "bien_the_nhan",
            joinColumns = @JoinColumn(name = "bien_the_id"),
            inverseJoinColumns = @JoinColumn(name = "nhan_id")
    )
    @Builder.Default
    private Set<NhanSanPham> nhans = new HashSet<>();

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
