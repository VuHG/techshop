package com.techshop.module.cart.dto.response;

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
public class GioHangItemResponse {
    private Long id;                       // id dòng giỏ hàng
    private Long bienTheId;
    private Long sanPhamId;
    private String slug;
    private String tenSanPham;
    private Map<String, Object> thongSoBienThe;
    private String anhChinh;
    private BigDecimal gia;                 // giá hiển thị (đã tính khuyến mãi)
    private int soLuong;
    private int soLuongTon;
    private BigDecimal thanhTien;           // gia * soLuong
    private boolean conHang;                // còn hàng & đủ tồn cho số lượng hiện tại
}
