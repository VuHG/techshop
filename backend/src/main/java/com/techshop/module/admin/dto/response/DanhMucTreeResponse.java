package com.techshop.module.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** Cây danh mục cho admin: danh mục gốc + danh sách phân loại con kèm số sản phẩm. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DanhMucTreeResponse {
    private Long id;
    private String tenDanhMuc;
    private String slug;
    private String trangThai;
    private Integer thuTuHienThi;
    private Long danhMucChaId;                 // null = danh mục gốc
    private List<PhanLoaiNode> phanLoais;
    private List<DanhMucTreeResponse> danhMucCon;   // danh mục con (đệ quy)

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PhanLoaiNode {
        private Long id;
        private String tenPhanLoai;
        private long soSanPham;
    }
}
