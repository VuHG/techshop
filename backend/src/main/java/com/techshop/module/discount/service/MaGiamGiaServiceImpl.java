package com.techshop.module.discount.service;

import com.techshop.module.discount.dto.DongTinhGiam;
import com.techshop.module.discount.dto.KetQuaApDungMa;
import com.techshop.module.discount.entity.LichSuDungMa;
import com.techshop.module.discount.entity.MaGiamGia;
import com.techshop.module.discount.repository.LichSuDungMaRepository;
import com.techshop.module.discount.repository.MaGiamGiaRepository;
import com.techshop.module.discount.repository.MaGiamGiaSanPhamRepository;
import com.techshop.shared.exception.AppException;
import com.techshop.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MaGiamGiaServiceImpl implements MaGiamGiaService {

    private final MaGiamGiaRepository maGiamGiaRepo;
    private final MaGiamGiaSanPhamRepository maGiamGiaSanPhamRepo;
    private final LichSuDungMaRepository lichSuDungMaRepo;

    @Override
    @Transactional(readOnly = true)
    public KetQuaApDungMa kiemTraVaTinhGiam(String maCode, Long nguoiDungId, List<DongTinhGiam> items) {
        MaGiamGia ma = maGiamGiaRepo.findByMaCode(maCode.trim().toUpperCase())
                .orElseThrow(() -> new AppException(ErrorCode.DIS_001));

        // Trạng thái + thời gian hiệu lực
        OffsetDateTime now = OffsetDateTime.now();
        if (!"HOAT_DONG".equals(ma.getTrangThai())
                || now.isBefore(ma.getBatDau()) || now.isAfter(ma.getKetThuc())) {
            throw new AppException(ErrorCode.DIS_003);
        }

        // Còn lượt dùng
        if (ma.getSoLuongDaDung() >= ma.getSoLuongToiDa()) {
            throw new AppException(ErrorCode.DIS_002);
        }

        // User đã dùng mã này chưa
        if (lichSuDungMaRepo.existsByMaGiamGiaIdAndNguoiDungId(ma.getId(), nguoiDungId)) {
            throw new AppException(ErrorCode.DIS_004);
        }

        List<DongTinhGiam> dongHang = items == null ? List.of() : items;
        BigDecimal tongTienHang = dongHang.stream()
                .map(d -> d.getThanhTien() == null ? BigDecimal.ZERO : d.getThanhTien())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Điều kiện đơn tối thiểu (tính trên tổng tiền hàng).
        BigDecimal toiThieu = ma.getDieuKienToiThieu() == null ? BigDecimal.ZERO : ma.getDieuKienToiThieu();
        if (tongTienHang.compareTo(toiThieu) < 0) {
            throw new AppException(ErrorCode.DIS_005);
        }

        // Phạm vi áp dụng: có liên kết sản phẩm cụ thể → SAN_PHAM (trừ vào sản phẩm),
        // ngược lại → DON_HANG (trừ tổng đơn).
        List<Long> sanPhamApDung = maGiamGiaSanPhamRepo.findSanPhamIdsByMaGiamGiaId(ma.getId());
        boolean theoSanPham = !sanPhamApDung.isEmpty();

        if (!theoSanPham) {
            // ── Mã đơn hàng: giảm thẳng trên tổng tiền hàng ──
            BigDecimal tienGiam = tinhTienGiam(ma, tongTienHang);
            return KetQuaApDungMa.builder()
                    .maGiamGiaId(ma.getId())
                    .maCode(ma.getMaCode())
                    .tenMa(ma.getTenMa())
                    .loaiGiam(ma.getLoaiGiam())
                    .loaiApDung("DON_HANG")
                    .tienGiam(tienGiam)
                    .tongThanhToanSauGiam(tongTienHang.subtract(tienGiam))
                    .giamTheoBienThe(Map.of())
                    .build();
        }

        // ── Mã sản phẩm: chỉ trừ vào các dòng sản phẩm được áp dụng ──
        List<DongTinhGiam> dongApDung = dongHang.stream()
                .filter(d -> d.getSanPhamId() != null && sanPhamApDung.contains(d.getSanPhamId()))
                .toList();
        if (dongApDung.isEmpty()) {
            throw new AppException(ErrorCode.DIS_006);
        }

        BigDecimal tongApDung = dongApDung.stream()
                .map(d -> d.getThanhTien() == null ? BigDecimal.ZERO : d.getThanhTien())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tổng tiền giảm = tính trên tổng tiền các sản phẩm được áp dụng.
        BigDecimal tongGiam = tinhTienGiam(ma, tongApDung);

        // Phân bổ theo tỉ lệ thành tiền từng dòng; dòng cuối nhận phần dư để tổng khớp.
        Map<Long, BigDecimal> giamTheoBienThe = new LinkedHashMap<>();
        BigDecimal daPhanBo = BigDecimal.ZERO;
        for (int i = 0; i < dongApDung.size(); i++) {
            DongTinhGiam d = dongApDung.get(i);
            BigDecimal giamDong;
            if (i == dongApDung.size() - 1) {
                giamDong = tongGiam.subtract(daPhanBo);
            } else {
                BigDecimal thanhTien = d.getThanhTien() == null ? BigDecimal.ZERO : d.getThanhTien();
                giamDong = tongApDung.signum() == 0 ? BigDecimal.ZERO
                        : tongGiam.multiply(thanhTien).divide(tongApDung, 0, RoundingMode.HALF_UP);
                daPhanBo = daPhanBo.add(giamDong);
            }
            giamTheoBienThe.merge(d.getBienTheId(), giamDong, BigDecimal::add);
        }

        return KetQuaApDungMa.builder()
                .maGiamGiaId(ma.getId())
                .maCode(ma.getMaCode())
                .tenMa(ma.getTenMa())
                .loaiGiam(ma.getLoaiGiam())
                .loaiApDung("SAN_PHAM")
                .tienGiam(tongGiam)
                .tongThanhToanSauGiam(tongTienHang.subtract(tongGiam))
                .giamTheoBienThe(giamTheoBienThe)
                .build();
    }

    @Override
    @Transactional
    public void ghiNhanSuDung(Long maGiamGiaId, Long nguoiDungId, Long donHangId) {
        int rows = maGiamGiaRepo.tangLuotDung(maGiamGiaId);
        if (rows == 0) {
            throw new AppException(ErrorCode.DIS_002);
        }
        lichSuDungMaRepo.save(LichSuDungMa.builder()
                .maGiamGiaId(maGiamGiaId)
                .nguoiDungId(nguoiDungId)
                .donHangId(donHangId)
                .build());
    }

    @Override
    @Transactional
    public void hoanTraSuDung(Long maGiamGiaId, Long donHangId) {
        maGiamGiaRepo.hoanLuotDung(maGiamGiaId);
        lichSuDungMaRepo.deleteByDonHangId(donHangId);
    }

    // ── Helper ───────────────────────────────────────────────────────

    private BigDecimal tinhTienGiam(MaGiamGia ma, BigDecimal tongTienHang) {
        BigDecimal tienGiam;
        if ("PHAN_TRAM".equals(ma.getLoaiGiam())) {
            tienGiam = tongTienHang.multiply(ma.getGiaTriGiam())
                    .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
            if (ma.getGiaTriGiamToiDa() != null
                    && tienGiam.compareTo(ma.getGiaTriGiamToiDa()) > 0) {
                tienGiam = ma.getGiaTriGiamToiDa();
            }
        } else { // SO_TIEN_CO_DINH
            tienGiam = ma.getGiaTriGiam();
        }
        // Không giảm quá tổng tiền hàng
        if (tienGiam.compareTo(tongTienHang) > 0) {
            tienGiam = tongTienHang;
        }
        return tienGiam;
    }
}
