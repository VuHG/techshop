package com.techshop.module.profile.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class DiaChiRequest {

    @NotBlank(message = "Vui lòng nhập họ tên người nhận")
    private String hoTenNguoiNhan;

    @NotBlank(message = "Vui lòng nhập số điện thoại")
    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại không hợp lệ")
    private String soDienThoai;

    @NotBlank(message = "Vui lòng nhập địa chỉ chi tiết")
    private String diaChiChiTiet;

    @NotBlank(message = "Vui lòng chọn phường/xã")
    private String phuongXa;

    @NotBlank(message = "Vui lòng chọn quận/huyện")
    private String quanHuyen;

    @NotBlank(message = "Vui lòng chọn tỉnh/thành")
    private String tinhThanh;

    private boolean laMacDinh;
}
