package com.techshop.module.product.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class SanPhamDetailResponse {
    private Long id;
    private String slug;
    private String tenSanPham;
    private String moTa;
    private String moTaNgan;
    private String thuongHieu;
    private Long phanLoaiId;
    private Map<String, Object> thongSoKyThuat;
    private BigDecimal diemDanhGiaTb;
    private int soLuotDanhGia;
    private int soLuotBan;
    private List<BienTheResponse> bienThes;
    private List<SanPhamCardResponse> sanPhamTuongTu;
}
