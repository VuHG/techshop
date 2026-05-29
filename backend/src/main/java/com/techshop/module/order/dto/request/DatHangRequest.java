package com.techshop.module.order.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.List;

@Data
public class DatHangRequest {

    @NotBlank(message = "Vui lòng nhập họ tên người nhận")
    private String hoTenNguoiNhan;

    @NotBlank(message = "Vui lòng nhập số điện thoại người nhận")
    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại không hợp lệ")
    private String soDienThoaiNhan;

    @NotBlank(message = "Vui lòng nhập địa chỉ giao hàng")
    private String diaChiGiaoHang;

    @NotEmpty(message = "Vui lòng chọn ít nhất 1 sản phẩm để đặt hàng")
    private List<Long> gioHangIds;

    private String maGiamGia;   // optional, 1 mã/đơn

    private String ghiChu;      // optional
}
