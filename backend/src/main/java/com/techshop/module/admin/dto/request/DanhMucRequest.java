package com.techshop.module.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Thêm/sửa danh mục gốc. */
@Data
public class DanhMucRequest {

    @NotBlank(message = "Tên danh mục không được để trống")
    private String tenDanhMuc;

    private String slug;             // tùy chọn — bỏ trống thì tự sinh

    private Long danhMucChaId;       // null = danh mục gốc; có = danh mục con

    private Integer thuTuHienThi;

    private String trangThai;        // HIEN_THI | AN (mặc định HIEN_THI)
}
