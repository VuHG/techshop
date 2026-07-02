package com.techshop.module.dexuat.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Đề xuất voucher — theo sản phẩm (SAN_PHAM) hoặc theo tổng hóa đơn (TONG_HOA_DON).
 * Admin Chấp nhận → tạo mã giảm giá thật; Từ chối → bỏ; tự HET_HAN sau 3 ngày.
 */
@Entity
@Table(name = "de_xuat_voucher")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeXuatVoucher {

    public static final String CHO_DUYET = "CHO_DUYET";
    public static final String CHAP_NHAN = "CHAP_NHAN";
    public static final String TU_CHOI = "TU_CHOI";
    public static final String HET_HAN = "HET_HAN";

    public static final String PHAM_VI_SAN_PHAM = "SAN_PHAM";
    public static final String PHAM_VI_TONG_HOA_DON = "TONG_HOA_DON";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pham_vi", nullable = false, length = 20)
    private String phamVi;

    /** Chỉ có khi phamVi = SAN_PHAM. */
    @Column(name = "san_pham_id")
    private Long sanPhamId;

    @Column(name = "ten_ma", nullable = false, length = 150)
    private String tenMa;

    @Column(name = "loai_giam", nullable = false, length = 20)
    private String loaiGiam;   // PHAN_TRAM | SO_TIEN_CO_DINH

    @Column(name = "gia_tri_giam", nullable = false, precision = 15, scale = 2)
    private BigDecimal giaTriGiam;

    @Column(name = "gia_tri_giam_toi_da", precision = 15, scale = 2)
    private BigDecimal giaTriGiamToiDa;

    @Column(name = "dieu_kien_toi_thieu", precision = 15, scale = 2)
    private BigDecimal dieuKienToiThieu;

    @Column(name = "so_ngay_hieu_luc", nullable = false)
    private int soNgayHieuLuc;

    @Column(name = "ly_do", nullable = false, columnDefinition = "text")
    private String lyDo;

    @Column(name = "trang_thai", nullable = false, length = 20)
    private String trangThai;

    @Column(name = "ngay_tao", nullable = false, updatable = false)
    private OffsetDateTime ngayTao;

    @Column(name = "ngay_het_han", nullable = false)
    private OffsetDateTime ngayHetHan;

    @Column(name = "ngay_xu_ly")
    private OffsetDateTime ngayXuLy;

    @PrePersist
    protected void onCreate() {
        if (ngayTao == null) ngayTao = OffsetDateTime.now();
        if (trangThai == null) trangThai = CHO_DUYET;
    }
}
