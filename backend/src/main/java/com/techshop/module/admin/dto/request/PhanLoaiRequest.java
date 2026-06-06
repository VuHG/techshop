package com.techshop.module.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** Thêm/sửa phân loại (con của một danh mục). */
@Data
public class PhanLoaiRequest {

    @NotBlank(message = "Tên phân loại không được để trống")
    private String tenPhanLoai;

    @NotNull(message = "Danh mục cha không được để trống")
    private Long danhMucId;
}
