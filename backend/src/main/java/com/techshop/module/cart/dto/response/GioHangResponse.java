package com.techshop.module.cart.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GioHangResponse {
    private List<GioHangItemResponse> items;
    private int tongSoLuong;       // tổng số lượng sản phẩm trong giỏ
    private BigDecimal tongTien;   // tổng tiền các item còn hàng
}
