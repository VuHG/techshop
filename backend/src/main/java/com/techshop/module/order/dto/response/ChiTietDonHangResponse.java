package com.techshop.module.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietDonHangResponse {
    private Long bienTheId;
    private String tenSanPham;
    private Map<String, Object> thongSoBienThe;
    private String duongDanAnhChinh;
    private BigDecimal giaLucMua;
    private int soLuong;
    private BigDecimal thanhTien;
    private BigDecimal tienGiamSanPham;   // mã giảm giá sản phẩm trừ thẳng vào dòng (null = không)
}
