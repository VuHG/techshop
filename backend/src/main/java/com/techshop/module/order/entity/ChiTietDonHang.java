package com.techshop.module.order.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;

/**
 * Dòng đơn hàng — snapshot đầy đủ tại thời điểm mua. bienTheId chỉ để tham chiếu,
 * KHÔNG dùng để JOIN lại lấy giá/tên khi hiển thị lịch sử.
 */
@Entity
@Table(name = "chi_tiet_don_hang")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietDonHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "don_hang_id", nullable = false)
    private DonHang donHang;

    @Column(name = "bien_the_id", nullable = false)
    private Long bienTheId;

    @Column(name = "ten_san_pham", nullable = false, length = 200)
    private String tenSanPham;

    @Column(name = "thong_so_bien_the", nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> thongSoBienThe;

    @Column(name = "duong_dan_anh_chinh", length = 500)
    private String duongDanAnhChinh;

    @Column(name = "gia_luc_mua", nullable = false, precision = 15, scale = 2)
    private BigDecimal giaLucMua;

    @Column(name = "so_luong", nullable = false)
    private int soLuong;

    @Column(name = "thanh_tien", nullable = false, precision = 15, scale = 2)
    private BigDecimal thanhTien;

    // Mã giảm giá áp dụng cho sản phẩm: tiền giảm trừ thẳng vào dòng này (V7).
    @Column(name = "ma_giam_gia_id")
    private Long maGiamGiaId;

    @Column(name = "tien_giam_san_pham", precision = 15, scale = 2)
    private BigDecimal tienGiamSanPham;

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
