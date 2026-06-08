package com.techshop.module.discount.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * Xem trước mã giảm giá. Frontend đã có giỏ hàng nên gửi sẵn các dòng hàng đang chọn
 * (giữ discount module độc lập, không đọc giỏ hàng của module khác).
 */
@Data
public class ApDungMaRequest {

    @NotBlank(message = "Vui lòng nhập mã giảm giá")
    private String maCode;

    @NotEmpty(message = "Thiếu danh sách sản phẩm")
    private List<Dong> items;

    @Data
    public static class Dong {
        private Long bienTheId;
        private Long sanPhamId;
        private BigDecimal thanhTien;
    }
}
