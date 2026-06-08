package com.techshop.module.admin.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

/** Thêm/sửa MỘT biến thể (form thêm biến thể của sản phẩm). */
@Data
public class BienTheUpsertRequest {

    private String tenBienThe;

    @NotNull(message = "Giá niêm yết không được để trống")
    @PositiveOrZero(message = "Giá niêm yết không hợp lệ")
    private BigDecimal gia;            // giá niêm yết

    private BigDecimal giaBan;         // giá bán (≤ niêm yết) → lưu vào gia_khuyen_mai

    @PositiveOrZero(message = "Số lượng tồn không hợp lệ")
    private int soLuongTon;

    private boolean laMacDinh;

    private Map<String, Object> thongSoBienThe;  // chọn từ filter schema (chi_tiet_thuoc_tinh_loc)
}
