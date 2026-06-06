package com.techshop.module.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/** Một dòng trong danh sách sản phẩm (admin). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminSanPhamSummaryResponse {
    private Long id;
    private String tenSanPham;
    private String slug;
    private String thuongHieu;
    private Long phanLoaiId;
    private String tenPhanLoai;
    private String tenDanhMuc;
    private String anhChinh;
    private BigDecimal giaThap;
    private BigDecimal giaCao;
    private int tongTon;
    private int soBienThe;
    private String trangThai;
    private List<String> nhans;   // tên nhãn (gộp từ các biến thể)
}
