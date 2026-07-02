package com.techshop.module.dexuat.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
public class DeXuatGiaResponse {
    private Long id;
    private Long bienTheId;
    private String tenSanPham;
    private String mauSac;
    private BigDecimal gia;          // giá gốc
    private BigDecimal giaCu;        // giá đang bán trước đề xuất
    private BigDecimal giaDeXuat;
    private String lyDo;
    private OffsetDateTime ngayTao;
    private OffsetDateTime ngayHetHan;
}
