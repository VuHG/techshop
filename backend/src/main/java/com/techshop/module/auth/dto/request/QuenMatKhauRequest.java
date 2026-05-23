package com.techshop.module.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QuenMatKhauRequest {

    @NotBlank(message = "Số điện thoại không được để trống")
    private String soDienThoai;
}
