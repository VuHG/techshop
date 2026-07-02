package com.techshop.module.dexuat.service;

import com.techshop.module.dexuat.entity.DeXuatVoucher;
import com.techshop.module.dexuat.repository.DeXuatVoucherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Engine SINH đề xuất voucher (rule-based) — chờ admin duyệt.
 *  - Theo SẢN PHẨM: sản phẩm tồn cao/bán chậm → voucher giảm cho sản phẩm đó.
 *  - Theo TỔNG HÓA ĐƠN: đề xuất 1 voucher kích cầu chung khi chưa có đề xuất chờ duyệt.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DeXuatVoucherGenerator {

    private static final int TON_MIN = 40;
    private static final int BAN_MAX = 10;
    private static final int SO_NGAY_HET_HAN = 3;
    private static final int GIOI_HAN_SAN_PHAM = 8;

    private final DeXuatVoucherRepository deXuatVoucherRepo;

    /** Chạy sau khởi động 60s, lặp mỗi 24 giờ. Trả số đề xuất mới sinh. */
    @Scheduled(initialDelay = 60_000, fixedDelay = 86_400_000)
    @Transactional
    public int sinh() {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime hetHan = now.plusDays(SO_NGAY_HET_HAN);
        int dem = 0;

        // ── 1) Voucher theo sản phẩm cho hàng tồn cao / bán chậm ──
        List<Object[]> sps = deXuatVoucherRepo.timSanPhamTonCaoBanCham(TON_MIN, BAN_MAX);
        for (Object[] r : sps) {
            if (dem >= GIOI_HAN_SAN_PHAM) break;
            Long sanPhamId = ((Number) r[0]).longValue();
            String ten = (String) r[1];
            long ton = ((Number) r[2]).longValue();
            long ban = ((Number) r[3]).longValue();
            if (deXuatVoucherRepo.existsBySanPhamIdAndTrangThai(sanPhamId, DeXuatVoucher.CHO_DUYET)) continue;

            deXuatVoucherRepo.save(DeXuatVoucher.builder()
                    .phamVi(DeXuatVoucher.PHAM_VI_SAN_PHAM)
                    .sanPhamId(sanPhamId)
                    .tenMa("Giảm 10% - " + ten)
                    .loaiGiam("PHAN_TRAM")
                    .giaTriGiam(BigDecimal.TEN)
                    .giaTriGiamToiDa(new BigDecimal("500000"))
                    .dieuKienToiThieu(null)
                    .soNgayHieuLuc(7)
                    .lyDo("Sản phẩm \"" + ten + "\" tồn cao (" + ton + "), mới bán " + ban
                            + " → đề xuất voucher giảm 10% (tối đa 500.000đ) để kích cầu.")
                    .trangThai(DeXuatVoucher.CHO_DUYET)
                    .ngayTao(now)
                    .ngayHetHan(hetHan)
                    .build());
            dem++;
        }

        // ── 2) Voucher theo tổng hóa đơn (chỉ giữ 1 đề xuất chờ duyệt cùng lúc) ──
        if (!deXuatVoucherRepo.existsByPhamViAndTrangThai(DeXuatVoucher.PHAM_VI_TONG_HOA_DON, DeXuatVoucher.CHO_DUYET)) {
            deXuatVoucherRepo.save(DeXuatVoucher.builder()
                    .phamVi(DeXuatVoucher.PHAM_VI_TONG_HOA_DON)
                    .sanPhamId(null)
                    .tenMa("Giảm 5% toàn đơn từ 500K")
                    .loaiGiam("PHAN_TRAM")
                    .giaTriGiam(new BigDecimal("5"))
                    .giaTriGiamToiDa(new BigDecimal("200000"))
                    .dieuKienToiThieu(new BigDecimal("500000"))
                    .soNgayHieuLuc(7)
                    .lyDo("Kích cầu doanh số tổng: đề xuất voucher giảm 5% (tối đa 200.000đ) cho đơn từ 500.000đ.")
                    .trangThai(DeXuatVoucher.CHO_DUYET)
                    .ngayTao(now)
                    .ngayHetHan(hetHan)
                    .build());
            dem++;
        }

        if (dem > 0) log.info("[de-xuat-voucher] Sinh {} đề xuất voucher mới", dem);
        return dem;
    }
}
