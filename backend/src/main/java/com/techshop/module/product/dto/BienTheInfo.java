package com.techshop.module.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

/**
 * DTO biên giới module: thông tin biến thể mà các module khác (cart, order)
 * cần để hiển thị giỏ hàng và chụp snapshot khi đặt hàng.
 * Không lộ @Entity của product ra ngoài.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BienTheInfo {
    private Long bienTheId;
    private Long sanPhamId;
    private String tenSanPham;
    private String thuongHieu;
    private String slug;
    private Map<String, Object> thongSoBienThe;
    private String anhChinh;
    private BigDecimal gia;
    private BigDecimal giaKhuyenMai;
    private BigDecimal giaHienThi;   // giaKhuyenMai nếu có, ngược lại gia
    private int soLuongTon;
    private String trangThai;
    private boolean conHang;
}
