package com.techshop.module.admin.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

/** Admin tạo tài khoản (CUSTOMER hoặc ADMIN). */
@Data
public class NguoiDungCreateRequest {

    @NotBlank(message = "Họ tên không được để trống")
    private String hoTen;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String soDienThoai;

    @Email(message = "Email không hợp lệ")
    private String email;

    private LocalDate ngaySinh;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự")
    private String matKhau;

    @NotBlank(message = "Vai trò không được để trống")
    private String vaiTro;            // CUSTOMER | ADMIN
}
