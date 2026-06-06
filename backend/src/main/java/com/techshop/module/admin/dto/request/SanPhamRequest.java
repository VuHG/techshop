package com.techshop.module.admin.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.Map;

/** Thêm/sửa sản phẩm (kèm biến thể). Ảnh truyền dạng URL. */
@Data
public class SanPhamRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String tenSanPham;

    private String slug;                   // tùy chọn — bỏ trống thì tự sinh từ tên

    private String moTa;

    private String moTaNgan;

    @NotNull(message = "Phân loại không được để trống")
    private Long phanLoaiId;

    private String thuongHieu;

    private Map<String, Object> thongSoKyThuat;  // thông số chung của sản phẩm

    private String trangThai;              // CON_HANG | NGUNG_BAN | BAN_NHAP (mặc định CON_HANG)

    @NotEmpty(message = "Sản phẩm phải có ít nhất một biến thể")
    @Valid
    private List<BienTheRequest> bienThes;
}
