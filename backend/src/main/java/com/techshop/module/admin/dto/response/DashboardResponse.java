package com.techshop.module.admin.dto.response;

import com.techshop.module.order.dto.response.DonHangSummaryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private Kpi kpi;
    private List<DiemDoanhThu> doanhThuTheoNgay;
    private List<DanhMucDoanhThu> doanhThuTheoDanhMuc;
    private List<DonHangSummaryResponse> donMoiNhat;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Kpi {
        private BigDecimal tongDoanhThu;
        private long donMoi;
        private long khachMoi;
        private long donChoXuLy;
        // % thay đổi so với kỳ trước (null nếu kỳ trước = 0).
        private Double doanhThuThayDoi;
        private Double donThayDoi;
        private Double khachThayDoi;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiemDoanhThu {
        private String ngay;          // yyyy-MM-dd
        private BigDecimal doanhThu;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DanhMucDoanhThu {
        private String tenDanhMuc;
        private BigDecimal doanhThu;
    }
}
