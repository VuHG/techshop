package com.techshop.module.order.service;

import com.techshop.module.cart.dto.response.GioHangItemResponse;
import com.techshop.module.cart.service.GioHangService;
import com.techshop.module.discount.dto.KetQuaApDungMa;
import com.techshop.module.discount.service.MaGiamGiaService;
import com.techshop.module.order.dto.request.DatHangRequest;
import com.techshop.module.order.dto.response.ChiTietDonHangResponse;
import com.techshop.module.order.dto.response.DonHangResponse;
import com.techshop.module.order.dto.response.DonHangSummaryResponse;
import com.techshop.module.order.dto.response.TrangThaiResponse;
import com.techshop.module.order.entity.ChiTietDonHang;
import com.techshop.module.order.entity.DonHang;
import com.techshop.module.order.entity.LichSuTrangThaiDonHang;
import com.techshop.module.order.repository.DonHangRepository;
import com.techshop.module.product.dto.BienTheInfo;
import com.techshop.module.product.service.ProductQueryService;
import com.techshop.shared.exception.AppException;
import com.techshop.shared.exception.ErrorCode;
import com.techshop.shared.response.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DonHangService {

    private final DonHangRepository donHangRepo;
    private final GioHangService gioHangService;
    private final ProductQueryService productQueryService;
    private final MaGiamGiaService maGiamGiaService;

    // Chính sách phí vận chuyển (business logic ở Java, không tính ở DB).
    private static final BigDecimal PHI_SHIP = BigDecimal.valueOf(30000);
    private static final BigDecimal NGUONG_MIEN_SHIP = BigDecimal.valueOf(5000000);

    // ─── Đặt hàng (checkout) ──────────────────────────────────────────

    @Transactional
    public DonHangResponse datHang(Long nguoiDungId, DatHangRequest req) {
        List<GioHangItemResponse> items =
                gioHangService.layItemDaChon(nguoiDungId, req.getGioHangIds());
        if (items.isEmpty()) {
            throw new AppException(ErrorCode.CART_002);
        }

        // 1. Snapshot + tổng tiền hàng. Kiểm tra còn hàng trước khi trừ kho.
        BigDecimal tongTienHang = BigDecimal.ZERO;
        List<ChiTietDonHang> chiTietList = new ArrayList<>();
        List<Long> sanPhamIds = new ArrayList<>();

        for (GioHangItemResponse item : items) {
            if (!item.isConHang()) {
                throw new AppException(ErrorCode.CART_001);
            }
            tongTienHang = tongTienHang.add(item.getThanhTien());
            sanPhamIds.add(item.getSanPhamId());

            chiTietList.add(ChiTietDonHang.builder()
                    .bienTheId(item.getBienTheId())
                    .tenSanPham(item.getTenSanPham())
                    .thongSoBienThe(item.getThongSoBienThe())
                    .duongDanAnhChinh(item.getAnhChinh())
                    .giaLucMua(item.getGia())
                    .soLuong(item.getSoLuong())
                    .thanhTien(item.getThanhTien())
                    .build());
        }

        // 2. Áp mã giảm giá (1 mã/đơn) — chỉ kiểm tra & tính, chưa ghi nhận.
        BigDecimal tienGiamGia = BigDecimal.ZERO;
        Long maGiamGiaId = null;
        if (req.getMaGiamGia() != null && !req.getMaGiamGia().isBlank()) {
            KetQuaApDungMa kq = maGiamGiaService.kiemTraVaTinhGiam(
                    req.getMaGiamGia(), nguoiDungId, tongTienHang, sanPhamIds);
            tienGiamGia = kq.getTienGiam();
            maGiamGiaId = kq.getMaGiamGiaId();
        }

        // 3. Phí ship + tổng thanh toán.
        BigDecimal phiVanChuyen = tinhPhiVanChuyen(tongTienHang);
        BigDecimal tongThanhToan = tongTienHang.subtract(tienGiamGia).add(phiVanChuyen);

        // 4. Trừ kho atomic — nếu bất kỳ item nào không đủ kho thì cả giao dịch rollback.
        for (GioHangItemResponse item : items) {
            boolean ok = productQueryService.truTonKho(item.getBienTheId(), item.getSoLuong());
            if (!ok) {
                throw new AppException(ErrorCode.CART_001);
            }
        }

        // 5. Tạo đơn (COD → vào thẳng CHO_XU_LY) + snapshot + timeline.
        DonHang donHang = DonHang.builder()
                .maDonHang(sinhMaDonHang())
                .nguoiDungId(nguoiDungId)
                .hoTenNguoiNhan(req.getHoTenNguoiNhan())
                .soDienThoaiNhan(req.getSoDienThoaiNhan())
                .diaChiGiaoHang(req.getDiaChiGiaoHang())
                .phuongThucThanhToan("COD")
                .trangThai("CHO_XU_LY")
                .tongTienHang(tongTienHang)
                .tienGiamGia(tienGiamGia)
                .phiVanChuyen(phiVanChuyen)
                .tongThanhToan(tongThanhToan)
                .maGiamGiaId(maGiamGiaId)
                .ghiChu(req.getGhiChu())
                .build();
        chiTietList.forEach(donHang::themChiTiet);
        donHang.themLichSu(LichSuTrangThaiDonHang.builder()
                .trangThai("CHO_XU_LY")
                .ghiChu("Đơn hàng đã được tạo, chờ xử lý")
                .build());

        DonHang saved = donHangRepo.save(donHang);
        Long donHangId = saved.getId();

        // 6. Ghi nhận dùng mã (atomic) sau khi đã có id đơn.
        //    Lưu ý: tangLuotDung là @Modifying(clearAutomatically) → clear persistence context.
        if (maGiamGiaId != null) {
            maGiamGiaService.ghiNhanSuDung(maGiamGiaId, nguoiDungId, donHangId);
        }

        // 7. Xóa các item đã đặt khỏi giỏ.
        gioHangService.xoaItems(nguoiDungId, req.getGioHangIds());

        log.info("Tạo đơn hàng {} cho user {} — tổng thanh toán {}",
                saved.getMaDonHang(), nguoiDungId, tongThanhToan);

        // Re-fetch để map response trên entity managed (tránh lazy-load lỗi sau khi context bị clear).
        DonHang fresh = donHangRepo.findById(donHangId)
                .orElseThrow(() -> new AppException(ErrorCode.ORD_001));
        return toDetailResponse(fresh);
    }

    // ─── Danh sách đơn (6 tab trạng thái) ─────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<DonHangSummaryResponse> getDanhSach(
            Long nguoiDungId, String trangThai, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<DonHang> result = (trangThai == null || trangThai.isBlank())
                ? donHangRepo.findByNguoiDungIdOrderByNgayTaoDesc(nguoiDungId, pageable)
                : donHangRepo.findByNguoiDungIdAndTrangThaiOrderByNgayTaoDesc(
                        nguoiDungId, trangThai, pageable);

        List<DonHangSummaryResponse> items = result.getContent().stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toCollection(ArrayList::new));

        return PageResponse.of(items, result.getTotalElements(), result.getTotalPages(), page);
    }

    // ─── Chi tiết đơn ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public DonHangResponse getChiTiet(Long nguoiDungId, String maDonHang) {
        DonHang donHang = donHangRepo.findByMaDonHangAndNguoiDungId(maDonHang, nguoiDungId)
                .orElseThrow(() -> new AppException(ErrorCode.ORD_001));
        return toDetailResponse(donHang);
    }

    // ─── Hủy đơn (chỉ khi CHO_XU_LY) ──────────────────────────────────

    @Transactional
    public DonHangResponse huyDon(Long nguoiDungId, Long donHangId) {
        DonHang donHang = donHangRepo.findByIdAndNguoiDungId(donHangId, nguoiDungId)
                .orElseThrow(() -> new AppException(ErrorCode.ORD_001));

        if (!"CHO_XU_LY".equals(donHang.getTrangThai())) {
            throw new AppException(ErrorCode.ORD_002);
        }

        Long id = donHang.getId();
        Long maGiamGiaId = donHang.getMaGiamGiaId();
        // Snapshot chi tiết ra list thuần — an toàn khi @Modifying clear context phía sau.
        List<ChiTietDonHang> cts = new ArrayList<>(donHang.getChiTiet());

        // Cập nhật trạng thái + timeline TRƯỚC, lưu khi entity còn managed.
        donHang.setTrangThai("DA_HUY");
        donHang.themLichSu(LichSuTrangThaiDonHang.builder()
                .trangThai("DA_HUY")
                .ghiChu("Khách hàng hủy đơn")
                .build());
        donHangRepo.saveAndFlush(donHang);

        // Hoàn kho từng item (atomic) + hoàn lượt dùng mã.
        for (ChiTietDonHang ct : cts) {
            productQueryService.hoanTonKho(ct.getBienTheId(), ct.getSoLuong());
        }
        if (maGiamGiaId != null) {
            maGiamGiaService.hoanTraSuDung(maGiamGiaId, id);
        }

        DonHang fresh = donHangRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORD_001));
        return toDetailResponse(fresh);
    }

    // ─── Xác nhận đã nhận hàng (GIAO_THANH_CONG → HOAN_THANH) ──────────

    @Transactional
    public DonHangResponse xacNhanNhanHang(Long nguoiDungId, Long donHangId) {
        DonHang donHang = donHangRepo.findByIdAndNguoiDungId(donHangId, nguoiDungId)
                .orElseThrow(() -> new AppException(ErrorCode.ORD_001));

        if (!"GIAO_THANH_CONG".equals(donHang.getTrangThai())) {
            throw new AppException(ErrorCode.ORD_003);
        }

        Long id = donHang.getId();
        List<ChiTietDonHang> cts = new ArrayList<>(donHang.getChiTiet());

        // Cập nhật trạng thái + timeline TRƯỚC, lưu khi entity còn managed.
        donHang.setTrangThai("HOAN_THANH");
        donHang.themLichSu(LichSuTrangThaiDonHang.builder()
                .trangThai("HOAN_THANH")
                .ghiChu("Khách hàng xác nhận đã nhận hàng")
                .build());
        donHangRepo.saveAndFlush(donHang);

        // Lượt bán chỉ tăng khi đơn thực sự hoàn thành (gộp theo sản phẩm).
        Map<Long, Integer> soLuongTheoSanPham = new LinkedHashMap<>();
        for (ChiTietDonHang ct : cts) {
            BienTheInfo info = productQueryService.layThongTinBienThe(ct.getBienTheId());
            soLuongTheoSanPham.merge(info.getSanPhamId(), ct.getSoLuong(), Integer::sum);
        }
        soLuongTheoSanPham.forEach(productQueryService::tangSoLuotBan);

        DonHang fresh = donHangRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORD_001));
        return toDetailResponse(fresh);
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    private BigDecimal tinhPhiVanChuyen(BigDecimal tongTienHang) {
        return tongTienHang.compareTo(NGUONG_MIEN_SHIP) >= 0 ? BigDecimal.ZERO : PHI_SHIP;
    }

    // TK + yyyyMMdd + số thứ tự 3 chữ số trong ngày. Giả định lượng đơn/ngày thấp (MVP).
    private String sinhMaDonHang() {
        String prefix = "TK" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        long count = donHangRepo.countByMaDonHangStartingWith(prefix);
        return prefix + String.format("%03d", count + 1);
    }

    private DonHangResponse toDetailResponse(DonHang d) {
        List<ChiTietDonHangResponse> items = d.getChiTiet().stream()
                .map(ct -> ChiTietDonHangResponse.builder()
                        .bienTheId(ct.getBienTheId())
                        .tenSanPham(ct.getTenSanPham())
                        .thongSoBienThe(ct.getThongSoBienThe())
                        .duongDanAnhChinh(ct.getDuongDanAnhChinh())
                        .giaLucMua(ct.getGiaLucMua())
                        .soLuong(ct.getSoLuong())
                        .thanhTien(ct.getThanhTien())
                        .build())
                .collect(Collectors.toCollection(ArrayList::new));

        List<TrangThaiResponse> lichSu = d.getLichSu().stream()
                .sorted(java.util.Comparator.comparing(LichSuTrangThaiDonHang::getNgayTao))
                .map(ls -> TrangThaiResponse.builder()
                        .trangThai(ls.getTrangThai())
                        .ghiChu(ls.getGhiChu())
                        .ngayTao(ls.getNgayTao())
                        .build())
                .collect(Collectors.toCollection(ArrayList::new));

        return DonHangResponse.builder()
                .id(d.getId())
                .maDonHang(d.getMaDonHang())
                .trangThai(d.getTrangThai())
                .hoTenNguoiNhan(d.getHoTenNguoiNhan())
                .soDienThoaiNhan(d.getSoDienThoaiNhan())
                .diaChiGiaoHang(d.getDiaChiGiaoHang())
                .phuongThucThanhToan(d.getPhuongThucThanhToan())
                .tongTienHang(d.getTongTienHang())
                .tienGiamGia(d.getTienGiamGia())
                .phiVanChuyen(d.getPhiVanChuyen())
                .tongThanhToan(d.getTongThanhToan())
                .ghiChu(d.getGhiChu())
                .ngayTao(d.getNgayTao())
                .items(items)
                .lichSu(lichSu)
                .build();
    }

    private DonHangSummaryResponse toSummaryResponse(DonHang d) {
        List<ChiTietDonHang> ct = d.getChiTiet();
        int soLuong = ct.stream().mapToInt(ChiTietDonHang::getSoLuong).sum();
        ChiTietDonHang dau = ct.isEmpty() ? null : ct.get(0);

        return DonHangSummaryResponse.builder()
                .id(d.getId())
                .maDonHang(d.getMaDonHang())
                .trangThai(d.getTrangThai())
                .tongThanhToan(d.getTongThanhToan())
                .soLuongSanPham(soLuong)
                .tenSanPhamDau(dau == null ? null : dau.getTenSanPham())
                .anhDaiDien(dau == null ? null : dau.getDuongDanAnhChinh())
                .ngayTao(d.getNgayTao())
                .build();
    }
}
