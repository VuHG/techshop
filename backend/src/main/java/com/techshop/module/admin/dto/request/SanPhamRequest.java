package com.techshop.module.admin.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * Thêm/sửa "hộp chứa" sản phẩm. Biến thể được quản lý riêng (nút Thêm biến thể).
 * - Khi TẠO: thường chỉ gồm thông tin hộp chứa + ảnh, KHÔNG kèm biến thể.
 * - Khi SỬA: nếu bienThes = null → giữ nguyên biến thể hiện có (không đụng tới).
 */
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

    private String trangThai;              // CON_HANG | NGUNG_BAN | BAN_NHAP (mặc định CON_HANG)

    private List<String> anhUrls;          // ảnh cấp sản phẩm (bien_the_id = NULL)

    @Valid
    private List<BienTheRequest> bienThes; // tùy chọn — null = không đụng biến thể
}
