package com.techshop.module.discount.service;

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
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MaGiamGiaServiceImpl implements MaGiamGiaService {

    private final MaGiamGiaRepository maGiamGiaRepo;
    private final MaGiamGiaSanPhamRepository maGiamGiaSanPhamRepo;
    private final LichSuDungMaRepository lichSuDungMaRepo;

    @Override
    @Transactional(readOnly = true)
    public KetQuaApDungMa kiemTraVaTinhGiam(String maCode, Long nguoiDungId,
                                            BigDecimal tongTienHang, List<Long> sanPhamIds) {
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

        // Điều kiện đơn tối thiểu
        BigDecimal toiThieu = ma.getDieuKienToiThieu() == null ? BigDecimal.ZERO : ma.getDieuKienToiThieu();
        if (tongTienHang.compareTo(toiThieu) < 0) {
            throw new AppException(ErrorCode.DIS_005);
        }

        // Mã áp dụng cho sản phẩm cụ thể? Nếu có thì giỏ phải chứa ít nhất 1 sản phẩm đó.
        List<Long> sanPhamApDung = maGiamGiaSanPhamRepo.findSanPhamIdsByMaGiamGiaId(ma.getId());
        if (!sanPhamApDung.isEmpty()) {
            List<Long> trongGio = sanPhamIds == null ? Collections.emptyList() : sanPhamIds;
            boolean coGiaoNhau = sanPhamApDung.stream().anyMatch(trongGio::contains);
            if (!coGiaoNhau) {
                throw new AppException(ErrorCode.DIS_006);
            }
        }

        BigDecimal tienGiam = tinhTienGiam(ma, tongTienHang);

        return KetQuaApDungMa.builder()
                .maGiamGiaId(ma.getId())
                .maCode(ma.getMaCode())
                .tenMa(ma.getTenMa())
                .loaiGiam(ma.getLoaiGiam())
                .tienGiam(tienGiam)
                .tongThanhToanSauGiam(tongTienHang.subtract(tienGiam))
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
