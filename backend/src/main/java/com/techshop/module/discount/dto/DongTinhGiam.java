package com.techshop.module.discount.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Một dòng hàng (theo biến thể) gửi cho discount module để tính giảm.
 * Order/cart cung cấp; discount module không đọc giỏ hàng của module khác.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DongTinhGiam {
    private Long bienTheId;
    private Long sanPhamId;
    private BigDecimal thanhTien;   // giá * số lượng của dòng
}
