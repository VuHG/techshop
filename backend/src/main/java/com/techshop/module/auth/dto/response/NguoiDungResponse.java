package com.techshop.module.auth.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class NguoiDungResponse {
    private Long id;
    private String hoTen;
    private String soDienThoai;
    private String email;
    private LocalDate ngaySinh;
    private String vaiTro;
}
