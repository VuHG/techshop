package com.techshop.module.admin.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

/** Admin cập nhật hồ sơ người dùng (không đổi mật khẩu ở đây). */
@Data
public class NguoiDungUpdateRequest {

    @NotBlank(message = "Họ tên không được để trống")
    private String hoTen;

    @Email(message = "Email không hợp lệ")
    private String email;

    private LocalDate ngaySinh;

    @NotBlank(message = "Vai trò không được để trống")
    private String vaiTro;            // CUSTOMER | ADMIN
}
