package com.techshop.module.order.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Đơn hàng. Mọi thông tin nhận hàng & giá đều snapshot tại thời điểm đặt.
 * KHÔNG JOIN lại bảng product/discount để hiển thị lịch sử.
 */
@Entity
@Table(name = "don_hang")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_don_hang", nullable = false, unique = true, length = 20)
    private String maDonHang;

    @Column(name = "nguoi_dung_id", nullable = false)
    private Long nguoiDungId;

    @Column(name = "ho_ten_nguoi_nhan", nullable = false, length = 100)
    private String hoTenNguoiNhan;

    @Column(name = "so_dien_thoai_nhan", nullable = false, length = 15)
    private String soDienThoaiNhan;

    @Column(name = "dia_chi_giao_hang", nullable = false, columnDefinition = "TEXT")
    private String diaChiGiaoHang;

    @Column(name = "phuong_thuc_thanh_toan", nullable = false, length = 20)
    private String phuongThucThanhToan;

    @Column(name = "trang_thai", nullable = false, length = 30)
    private String trangThai;

    @Column(name = "tong_tien_hang", nullable = false, precision = 15, scale = 2)
    private BigDecimal tongTienHang;

    @Column(name = "tien_giam_gia", nullable = false, precision = 15, scale = 2)
    private BigDecimal tienGiamGia;

    @Column(name = "phi_van_chuyen", nullable = false, precision = 15, scale = 2)
    private BigDecimal phiVanChuyen;

    @Column(name = "tong_thanh_toan", nullable = false, precision = 15, scale = 2)
    private BigDecimal tongThanhToan;

    @Column(name = "ma_giam_gia_id")
    private Long maGiamGiaId;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @OneToMany(mappedBy = "donHang", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChiTietDonHang> chiTiet = new ArrayList<>();

    @OneToMany(mappedBy = "donHang", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LichSuTrangThaiDonHang> lichSu = new ArrayList<>();

    @Column(name = "ngay_tao", updatable = false)
    private OffsetDateTime ngayTao;

    @Column(name = "ngay_cap_nhat")
    private OffsetDateTime ngayCapNhat;

    public void themChiTiet(ChiTietDonHang ct) {
        ct.setDonHang(this);
        this.chiTiet.add(ct);
    }

    public void themLichSu(LichSuTrangThaiDonHang ls) {
        ls.setDonHang(this);
        this.lichSu.add(ls);
    }

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
