package com.techshop.module.dexuat.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
public class DeXuatVoucherResponse {
    private Long id;
    private String phamVi;          // SAN_PHAM | TONG_HOA_DON
    private Long sanPhamId;
    private String tenSanPham;      // null nếu TONG_HOA_DON
    private String tenMa;
    private String loaiGiam;        // PHAN_TRAM | SO_TIEN_CO_DINH
    private BigDecimal giaTriGiam;
    private BigDecimal giaTriGiamToiDa;
    private BigDecimal dieuKienToiThieu;
    private int soNgayHieuLuc;
    private String lyDo;
    private OffsetDateTime ngayTao;
    private OffsetDateTime ngayHetHan;
}
