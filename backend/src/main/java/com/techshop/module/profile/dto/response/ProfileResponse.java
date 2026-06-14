package com.techshop.module.profile.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private Long id;
    private String hoTen;
    private String soDienThoai;
    private String email;
    private LocalDate ngaySinh;
    private String avatarUrl;
    private String vaiTro;
}
