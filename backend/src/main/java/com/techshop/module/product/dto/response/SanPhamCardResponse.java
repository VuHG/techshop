package com.techshop.module.product.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class SanPhamCardResponse {
    private Long id;
    private String slug;
    private String tenSanPham;
    private String moTaNgan;
    private String thuongHieu;
    private BigDecimal giaThap;
    private BigDecimal giaCao;
    private BigDecimal diemDanhGiaTb;
    private int soLuotDanhGia;
    private String anhChinh;
    private List<NhanResponse> nhans;
}
