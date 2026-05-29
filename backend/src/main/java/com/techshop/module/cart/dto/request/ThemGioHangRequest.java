package com.techshop.module.cart.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ThemGioHangRequest {

    @NotNull(message = "Vui lòng chọn biến thể sản phẩm")
    private Long bienTheId;

    @NotNull(message = "Vui lòng nhập số lượng")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer soLuong;
}
