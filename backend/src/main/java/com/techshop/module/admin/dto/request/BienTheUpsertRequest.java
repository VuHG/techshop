package com.techshop.module.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

/** Thêm/sửa MỘT biến thể (form thêm biến thể của sản phẩm). */
@Data
public class BienTheUpsertRequest {

    private String tenBienThe;         // không dùng — tên tự sinh từ thông số + màu

    @NotBlank(message = "Màu sắc không được để trống")
    private String mauSac;             // màu sắc (tách khỏi thongSoBienThe)

    @NotNull(message = "Giá niêm yết không được để trống")
    @PositiveOrZero(message = "Giá niêm yết không hợp lệ")
    private BigDecimal gia;            // giá niêm yết

    @NotNull(message = "Giá khuyến mãi không được để trống")
    @PositiveOrZero(message = "Giá khuyến mãi không hợp lệ")
    private BigDecimal giaBan;         // giá khuyến mãi (≤ niêm yết) → lưu vào gia_khuyen_mai

    @PositiveOrZero(message = "Số lượng tồn không hợp lệ")
    private int soLuongTon;

    private boolean laMacDinh;         // chỉ dùng khi SỬA (thêm: hệ thống tự quyết định)

    private Map<String, Object> thongSoBienThe;  // chọn từ filter schema (chi_tiet_thuoc_tinh_loc)

    private java.util.List<Long> nhanIds;        // thẻ gắn cho RIÊNG biến thể này
}
