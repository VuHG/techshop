package com.techshop.module.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Thông tin tối thiểu của sản phẩm (cho module khác điều hướng/hiển thị). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SanPhamMini {
    private Long id;
    private String slug;
    private String tenSanPham;
    private String anhDaiDien;
}
