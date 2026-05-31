package com.techshop.module.flashsale.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;

/** Card flash sale cho trang chủ. */
@Data
@Builder
public class FlashSaleItemResponse {
    private Long flashSaleId;
    private Long bienTheId;
    private Long sanPhamId;
    private String slug;
    private String tenSanPham;
    private Map<String, Object> thongSoBienThe;
    private String anhChinh;
    private BigDecimal giaGoc;          // giá hiển thị thường (giaKhuyenMai ?? gia)
    private BigDecimal giaFlashSale;    // giá flash (giá cuối khi mua)
    private Integer phanTramGiam;       // % giảm so với giaGoc
    private Integer soLuongGioiHan;
    private Integer soLuongDaBan;
    private OffsetDateTime thoiGianKetThuc;
}
