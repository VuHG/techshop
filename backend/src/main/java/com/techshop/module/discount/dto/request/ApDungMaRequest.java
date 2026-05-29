package com.techshop.module.discount.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * Xem trước mã giảm giá. Frontend đã có giỏ hàng nên gửi sẵn tổng tiền + danh sách sản phẩm
 * (giữ discount module độc lập, không đọc giỏ hàng của module khác).
 */
@Data
public class ApDungMaRequest {

    @NotBlank(message = "Vui lòng nhập mã giảm giá")
    private String maCode;

    @NotNull(message = "Thiếu tổng tiền hàng")
    private BigDecimal tongTienHang;

    private List<Long> sanPhamIds;
}
