package com.techshop.module.review.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class TaoDanhGiaRequest {

    @NotNull(message = "Thiếu mã đơn hàng")
    private Long donHangId;

    @NotNull(message = "Thiếu biến thể sản phẩm")
    private Long bienTheId;

    @NotNull(message = "Vui lòng chọn số sao")
    @Min(value = 1, message = "Đánh giá từ 1 đến 5 sao")
    @Max(value = 5, message = "Đánh giá từ 1 đến 5 sao")
    private Integer diem;

    @Size(max = 2000, message = "Nội dung tối đa 2000 ký tự")
    private String noiDung;
}
