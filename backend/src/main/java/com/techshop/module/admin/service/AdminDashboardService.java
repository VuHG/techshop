package com.techshop.module.admin.service;

import com.techshop.module.admin.dto.response.DashboardResponse;
import com.techshop.module.auth.repository.NguoiDungRepository;
import com.techshop.module.order.repository.ChiTietDonHangRepository;
import com.techshop.module.order.repository.DonHangRepository;
import com.techshop.module.order.service.DonHangService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final DonHangRepository donHangRepo;
    private final ChiTietDonHangRepository chiTietRepo;
    private final NguoiDungRepository nguoiDungRepo;
    private final DonHangService donHangService;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(String range) {
        int days = switch (range == null ? "30d" : range) {
            case "7d" -> 7;
            case "90d" -> 90;
            default -> 30;
        };
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime from = now.minusDays(days);
        OffsetDateTime prevFrom = from.minusDays(days);

        // KPI kỳ hiện tại vs kỳ trước.
        BigDecimal doanhThu = donHangRepo.tinhDoanhThu(from, now);
        BigDecimal doanhThuTruoc = donHangRepo.tinhDoanhThu(prevFrom, from);
        long donMoi = donHangRepo.countByNgayTaoBetween(from, now);
        long donTruoc = donHangRepo.countByNgayTaoBetween(prevFrom, from);
        long khachMoi = nguoiDungRepo.countByNgayTaoBetween(from, now);
        long khachTruoc = nguoiDungRepo.countByNgayTaoBetween(prevFrom, from);
        long donChoXuLy = donHangRepo.countByTrangThai("CHO_XU_LY");

        DashboardResponse.Kpi kpi = DashboardResponse.Kpi.builder()
                .tongDoanhThu(doanhThu)
                .donMoi(donMoi)
                .khachMoi(khachMoi)
                .donChoXuLy(donChoXuLy)
                .doanhThuThayDoi(phanTramThayDoi(doanhThu.doubleValue(), doanhThuTruoc.doubleValue()))
                .donThayDoi(phanTramThayDoi(donMoi, donTruoc))
                .khachThayDoi(phanTramThayDoi(khachMoi, khachTruoc))
                .build();

        List<DashboardResponse.DiemDoanhThu> theoNgay = donHangRepo.doanhThuTheoNgay(from).stream()
                .map(r -> DashboardResponse.DiemDoanhThu.builder()
                        .ngay(r[0].toString())
                        .doanhThu(toBigDecimal(r[1]))
                        .build())
                .toList();

        List<DashboardResponse.DanhMucDoanhThu> theoDanhMuc = chiTietRepo.doanhThuTheoDanhMuc(from).stream()
                .map(r -> DashboardResponse.DanhMucDoanhThu.builder()
                        .tenDanhMuc((String) r[0])
                        .doanhThu(toBigDecimal(r[1]))
                        .build())
                .toList();

        return DashboardResponse.builder()
                .kpi(kpi)
                .doanhThuTheoNgay(theoNgay)
                .doanhThuTheoDanhMuc(theoDanhMuc)
                .donMoiNhat(donHangService.getDanhSachAdmin("", "", null, null, 0, 8).getItems())
                .build();
    }

    private Double phanTramThayDoi(double cur, double prev) {
        if (prev == 0) return cur > 0 ? 100.0 : null;
        return Math.round((cur - prev) / prev * 1000.0) / 10.0;
    }

    private BigDecimal toBigDecimal(Object o) {
        if (o == null) return BigDecimal.ZERO;
        if (o instanceof BigDecimal b) return b;
        return new BigDecimal(o.toString());
    }
}
