package com.techshop.module.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SanPhamDetailResponse {
    private Long id;
    private String slug;
    private String tenSanPham;
    private String moTa;
    private String moTaNgan;
    private String thuongHieu;
    private Long phanLoaiId;
    // Sơ đồ phiên bản: { "<chuỗi thông số>": { "<màu>": <id biến thể> } } — dùng để chọn phiên bản.
    private Map<String, Object> banDoBienThe;
    private BigDecimal diemDanhGiaTb;
    private int soLuotDanhGia;
    private int soLuotBan;
    private List<BienTheResponse> bienThes;
    private List<SanPhamCardResponse> sanPhamTuongTu;
}
