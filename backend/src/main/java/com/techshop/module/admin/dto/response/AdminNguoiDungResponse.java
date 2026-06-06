package com.techshop.module.admin.dto.response;

import com.techshop.module.profile.dto.response.DiaChiResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminNguoiDungResponse {
    private Long id;
    private String hoTen;
    private String soDienThoai;
    private String email;
    private LocalDate ngaySinh;
    private String vaiTro;
    private String trangThai;
    private OffsetDateTime ngayTao;

    // Chỉ có ở chi tiết.
    private ThongKe thongKe;
    private List<DiaChiResponse> diaChis;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ThongKe {
        private long soDon;
        private long soDanhGia;
        private long soDiaChi;
    }
}
