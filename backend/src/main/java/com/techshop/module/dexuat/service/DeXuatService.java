package com.techshop.module.dexuat.service;

import com.techshop.module.dexuat.dto.DeXuatGiaResponse;
import com.techshop.module.dexuat.dto.DeXuatVoucherResponse;
import com.techshop.module.dexuat.entity.DeXuatGia;
import com.techshop.module.dexuat.entity.DeXuatVoucher;
import com.techshop.module.dexuat.repository.DeXuatGiaRepository;
import com.techshop.module.dexuat.repository.DeXuatVoucherRepository;
import com.techshop.module.discount.entity.MaGiamGia;
import com.techshop.module.discount.entity.MaGiamGiaSanPham;
import com.techshop.module.discount.repository.MaGiamGiaRepository;
import com.techshop.module.discount.repository.MaGiamGiaSanPhamRepository;
import com.techshop.module.product.entity.BienTheSanPham;
import com.techshop.module.product.repository.BienTheSanPhamRepository;
import com.techshop.module.product.repository.SanPhamRepository;
import com.techshop.shared.exception.AppException;
import com.techshop.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** Duyệt đề xuất giá & voucher: liệt kê CHO_DUYET, chấp nhận/từ chối, dọn hết hạn, tạo thủ công. */
@Service
@RequiredArgsConstructor
public class DeXuatService {

    private static final String ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private final SecureRandom random = new SecureRandom();

    private final DeXuatGiaRepository deXuatGiaRepo;
    private final DeXuatVoucherRepository deXuatVoucherRepo;
    private final BienTheSanPhamRepository bienTheRepo;
    private final SanPhamRepository sanPhamRepo;
    private final MaGiamGiaRepository maGiamGiaRepo;
    private final MaGiamGiaSanPhamRepository maGiamGiaSanPhamRepo;

    private final DeXuatGiaGenerator giaGenerator;
    private final DeXuatVoucherGenerator voucherGenerator;
    private final MockMarketService mockMarketService;

    // ─────────────────── DANH SÁCH ───────────────────

    @Transactional(readOnly = true)
    public List<DeXuatGiaResponse> danhSachGia() {
        OffsetDateTime now = OffsetDateTime.now();
        List<DeXuatGia> ds = deXuatGiaRepo.findByTrangThaiOrderByNgayTaoDesc(DeXuatGia.CHO_DUYET).stream()
                .filter(d -> d.getNgayHetHan().isAfter(now))
                .toList();
        if (ds.isEmpty()) return List.of();

        Map<Long, BienTheSanPham> btMap = bienTheRepo.findAllById(
                ds.stream().map(DeXuatGia::getBienTheId).toList()).stream()
                .collect(Collectors.toMap(BienTheSanPham::getId, b -> b));

        return ds.stream().map(d -> {
            BienTheSanPham bt = btMap.get(d.getBienTheId());
            return DeXuatGiaResponse.builder()
                    .id(d.getId())
                    .bienTheId(d.getBienTheId())
                    .tenSanPham(bt != null ? bt.getTenSanPham() : null)
                    .mauSac(bt != null ? bt.getMauSac() : null)
                    .gia(bt != null ? bt.getGia() : null)
                    .giaCu(d.getGiaCu())
                    .giaDeXuat(d.getGiaDeXuat())
                    .lyDo(d.getLyDo())
                    .ngayTao(d.getNgayTao())
                    .ngayHetHan(d.getNgayHetHan())
                    .build();
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<DeXuatVoucherResponse> danhSachVoucher() {
        OffsetDateTime now = OffsetDateTime.now();
        List<DeXuatVoucher> ds = deXuatVoucherRepo.findByTrangThaiOrderByNgayTaoDesc(DeXuatVoucher.CHO_DUYET).stream()
                .filter(d -> d.getNgayHetHan().isAfter(now))
                .toList();
        if (ds.isEmpty()) return List.of();

        Map<Long, String> tenSpMap = new HashMap<>();
        List<Long> spIds = ds.stream().map(DeXuatVoucher::getSanPhamId).filter(java.util.Objects::nonNull).toList();
        if (!spIds.isEmpty()) {
            sanPhamRepo.findAllById(spIds).forEach(sp -> tenSpMap.put(sp.getId(), sp.getTenSanPham()));
        }

        return ds.stream().map(d -> DeXuatVoucherResponse.builder()
                .id(d.getId())
                .phamVi(d.getPhamVi())
                .sanPhamId(d.getSanPhamId())
                .tenSanPham(d.getSanPhamId() != null ? tenSpMap.get(d.getSanPhamId()) : null)
                .tenMa(d.getTenMa())
                .loaiGiam(d.getLoaiGiam())
                .giaTriGiam(d.getGiaTriGiam())
                .giaTriGiamToiDa(d.getGiaTriGiamToiDa())
                .dieuKienToiThieu(d.getDieuKienToiThieu())
                .soNgayHieuLuc(d.getSoNgayHieuLuc())
                .lyDo(d.getLyDo())
                .ngayTao(d.getNgayTao())
                .ngayHetHan(d.getNgayHetHan())
                .build()).toList();
    }

    // ─────────────────── DUYỆT ĐỀ XUẤT GIÁ ───────────────────

    @Transactional
    @CacheEvict(value = "san-pham-chi-tiet", allEntries = true)
    public void chapNhanGia(Long id) {
        DeXuatGia d = layGiaChoDuyet(id);
        bienTheRepo.capNhatGiaKhuyenMai(d.getBienTheId(), d.getGiaDeXuat());
        d.setTrangThai(DeXuatGia.CHAP_NHAN);
        d.setNgayXuLy(OffsetDateTime.now());
        deXuatGiaRepo.save(d);
    }

    @Transactional
    public void tuChoiGia(Long id) {
        DeXuatGia d = layGiaChoDuyet(id);
        d.setTrangThai(DeXuatGia.TU_CHOI);
        d.setNgayXuLy(OffsetDateTime.now());
        deXuatGiaRepo.save(d);
    }

    private DeXuatGia layGiaChoDuyet(Long id) {
        DeXuatGia d = deXuatGiaRepo.findById(id).orElseThrow(() -> new AppException(ErrorCode.DX_001));
        if (!DeXuatGia.CHO_DUYET.equals(d.getTrangThai()) || d.getNgayHetHan().isBefore(OffsetDateTime.now())) {
            throw new AppException(ErrorCode.DX_001);
        }
        return d;
    }

    // ─────────────────── DUYỆT ĐỀ XUẤT VOUCHER ───────────────────

    @Transactional
    public void chapNhanVoucher(Long id) {
        DeXuatVoucher d = layVoucherChoDuyet(id);
        OffsetDateTime now = OffsetDateTime.now();

        MaGiamGia ma = MaGiamGia.builder()
                .maCode(taoMaCodeDuyNhat())
                .tenMa(d.getTenMa())
                .loaiGiam(d.getLoaiGiam())
                .giaTriGiam(d.getGiaTriGiam())
                .giaTriGiamToiDa(d.getGiaTriGiamToiDa())
                .dieuKienToiThieu(d.getDieuKienToiThieu())
                .soLuongToiDa(100)
                .soLuongDaDung(0)
                .batDau(now)
                .ketThuc(now.plusDays(d.getSoNgayHieuLuc()))
                .trangThai("HOAT_DONG")
                .build();
        MaGiamGia saved = maGiamGiaRepo.save(ma);

        // Voucher theo sản phẩm → gắn pivot (mã không có pivot = áp toàn bộ đơn).
        if (DeXuatVoucher.PHAM_VI_SAN_PHAM.equals(d.getPhamVi()) && d.getSanPhamId() != null) {
            maGiamGiaSanPhamRepo.save(MaGiamGiaSanPham.builder()
                    .maGiamGiaId(saved.getId())
                    .sanPhamId(d.getSanPhamId())
                    .build());
        }

        d.setTrangThai(DeXuatVoucher.CHAP_NHAN);
        d.setNgayXuLy(now);
        deXuatVoucherRepo.save(d);
    }

    @Transactional
    public void tuChoiVoucher(Long id) {
        DeXuatVoucher d = layVoucherChoDuyet(id);
        d.setTrangThai(DeXuatVoucher.TU_CHOI);
        d.setNgayXuLy(OffsetDateTime.now());
        deXuatVoucherRepo.save(d);
    }

    private DeXuatVoucher layVoucherChoDuyet(Long id) {
        DeXuatVoucher d = deXuatVoucherRepo.findById(id).orElseThrow(() -> new AppException(ErrorCode.DX_001));
        if (!DeXuatVoucher.CHO_DUYET.equals(d.getTrangThai()) || d.getNgayHetHan().isBefore(OffsetDateTime.now())) {
            throw new AppException(ErrorCode.DX_001);
        }
        return d;
    }

    private String taoMaCodeDuyNhat() {
        for (int lan = 0; lan < 20; lan++) {
            StringBuilder sb = new StringBuilder("AUTO");
            for (int i = 0; i < 6; i++) sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
            String code = sb.toString();
            if (maGiamGiaRepo.findByMaCode(code).isEmpty()) return code;
        }
        return "AUTO" + System.currentTimeMillis();
    }

    // ─────────────────── DỌN HẾT HẠN + TẠO THỦ CÔNG ───────────────────

    /** Dọn đề xuất quá 3 ngày → HET_HAN. Chạy sau khởi động 2 phút, lặp mỗi 12 giờ. */
    @Scheduled(initialDelay = 120_000, fixedDelay = 43_200_000)
    @Transactional
    public void donHetHan() {
        OffsetDateTime now = OffsetDateTime.now();
        deXuatGiaRepo.danhDauHetHan(now);
        deXuatVoucherRepo.danhDauHetHan(now);
    }

    /** Tạo đề xuất ngay (cho admin bấm nút demo/kiểm thử thay vì đợi lịch). */
    @Transactional
    public Map<String, Integer> taoDeXuatNgay() {
        mockMarketService.capNhatMockMarket();
        int gia = giaGenerator.sinh();
        int voucher = voucherGenerator.sinh();
        return Map.of("deXuatGia", gia, "deXuatVoucher", voucher);
    }
}
