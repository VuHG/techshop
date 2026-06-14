package com.techshop.module.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO biên giới module: thông tin tài khoản mà module khác (profile) cần,
 * không lộ @Entity NguoiDung ra ngoài.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NguoiDungInfo {
    private Long id;
    private String hoTen;
    private String soDienThoai;
    private String email;
    private LocalDate ngaySinh;
    private String avatarUrl;
    private String vaiTro;
}
