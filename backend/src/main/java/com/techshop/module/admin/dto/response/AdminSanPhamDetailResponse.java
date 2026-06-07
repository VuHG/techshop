package com.techshop.module.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminSanPhamDetailResponse {
    private Long id;
    private String tenSanPham;
    private String slug;
    private String moTa;
    private String moTaNgan;
    private Long phanLoaiId;
    private String tenPhanLoai;
    private String tenDanhMuc;
    private String thuongHieu;
    private Map<String, Object> thongSoKyThuat;
    private String trangThai;
    private List<AdminBienTheResponse> bienThes;
    private List<VoucherItem> vouchers;   // mã giảm giá áp dụng cho sản phẩm này

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class VoucherItem {
        private String maCode;
        private String tenMa;
    }
}
