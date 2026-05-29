package com.techshop.module.profile.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiaChiResponse {
    private Long id;
    private String hoTenNguoiNhan;
    private String soDienThoai;
    private String diaChiChiTiet;
    private String phuongXa;
    private String quanHuyen;
    private String tinhThanh;
    private boolean laMacDinh;
    private String diaChiDayDu;   // ghép sẵn để FE hiển thị nhanh
}
