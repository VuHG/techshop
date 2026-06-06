package com.techshop.module.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** Dữ liệu phụ trợ cho form sản phẩm: phân loại (kèm danh mục) + nhãn. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormOptionsResponse {

    private List<PhanLoaiOption> phanLoais;
    private List<NhanOption> nhans;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PhanLoaiOption {
        private Long id;
        private String tenPhanLoai;
        private Long danhMucId;
        private String tenDanhMuc;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NhanOption {
        private Long id;
        private String tenNhan;
        private String mauSac;
    }
}
