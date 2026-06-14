package com.techshop.module.product.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Card hiển thị theo BIẾN THỂ (1 biến thể = 1 card) cho các trang danh sách.
 * giaBan = gia_khuyen_mai nếu có, ngược lại gia. phanTramGiam = % giảm so với gia niêm yết.
 */
@Data
@Builder
public class BienTheCardResponse {
    private Long bienTheId;
    private Long sanPhamId;
    private String slug;
    private String tenSanPham;
    private String thuongHieu;
    private String tenBienThe;
    private String mauSac;
    private String trangThai;     // trạng thái biến thể (CON_HANG | HET_HANG)
    private Map<String, Object> thongSoBienThe;
    private String anhChinh;
    private BigDecimal gia;        // giá niêm yết
    private BigDecimal giaBan;     // giá bán hiệu lực (= giá flash nếu đang flash sale, ngược lại giaKhuyenMai ?? gia)
    private Integer phanTramGiam;  // % giảm so với gia (0 nếu không giảm)
    private boolean flashSale;     // true nếu biến thể đang trong flash sale còn hiệu lực
    private BigDecimal diemDanhGiaTb;
    private Integer soLuotDanhGia;
    private List<NhanResponse> nhans;
}
