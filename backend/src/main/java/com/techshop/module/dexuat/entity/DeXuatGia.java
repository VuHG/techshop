package com.techshop.module.dexuat.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/** Đề xuất giá khuyến mãi cho 1 biến thể — admin Chấp nhận/Từ chối, tự HET_HAN sau 3 ngày. */
@Entity
@Table(name = "de_xuat_gia")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeXuatGia {

    // Trạng thái đề xuất.
    public static final String CHO_DUYET = "CHO_DUYET";
    public static final String CHAP_NHAN = "CHAP_NHAN";
    public static final String TU_CHOI = "TU_CHOI";
    public static final String HET_HAN = "HET_HAN";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bien_the_id", nullable = false)
    private Long bienTheId;

    @Column(name = "gia_cu", precision = 15, scale = 2)
    private BigDecimal giaCu;

    @Column(name = "gia_de_xuat", nullable = false, precision = 15, scale = 2)
    private BigDecimal giaDeXuat;

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
