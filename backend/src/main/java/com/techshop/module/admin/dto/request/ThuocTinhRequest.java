package com.techshop.module.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

/** Thêm/sửa thuộc tính của một phân loại (kèm danh sách giá trị). */
@Data
public class ThuocTinhRequest {

    private Long phanLoaiId;        // bắt buộc khi TẠO mới

    @NotBlank(message = "Tên thuộc tính không được để trống")
    private String tenThuocTinh;

    private String maThuocTinh;     // khóa JSON (vd ram/cpu) — bỏ trống thì tự sinh

    private String kieuDuLieu;      // STRING (mặc định) | NUMBER ...

    private Integer thuTuHienThi;

    private List<String> giaTris;   // danh sách giá trị (vd 8GB/16GB/32GB)
}
