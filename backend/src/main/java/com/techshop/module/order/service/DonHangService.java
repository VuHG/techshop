package com.techshop.module.order.service;

import com.techshop.module.auth.dto.NguoiDungInfo;
import com.techshop.module.auth.service.NguoiDungQueryService;
import com.techshop.module.cart.dto.response.GioHangItemResponse;
import com.techshop.module.cart.service.GioHangService;
import com.techshop.module.discount.dto.DongTinhGiam;
import com.techshop.module.discount.dto.KetQuaApDungMa;
import com.techshop.module.discount.service.MaGiamGiaService;
import com.techshop.module.notification.service.NotificationService;
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
    private final NotificationService notificationService;
    private final NguoiDungQueryService nguoiDungQueryService;

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
        List<DongTinhGiam> dongTinhGiam = new ArrayList<>();

        for (GioHangItemResponse item : items) {
            if (!item.isConHang()) {
                throw new AppException(ErrorCode.CART_001);
            }
            tongTienHang = tongTienHang.add(item.getThanhTien());
            dongTinhGiam.add(DongTinhGiam.builder()
                    .bienTheId(item.getBienTheId())
                    .sanPhamId(item.getSanPhamId())
                    .thanhTien(item.getThanhTien())
                    .build());

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
        //    Mã sản phẩm: trừ thẳng vào từng dòng (tien_giam_san_pham). Mã đơn: trừ tổng đơn.
        BigDecimal tienGiamGia = BigDecimal.ZERO;
        Long maGiamGiaId = null;
        if (req.getMaGiamGia() != null && !req.getMaGiamGia().isBlank()) {
            KetQuaApDungMa kq = maGiamGiaService.kiemTraVaTinhGiam(
                    req.getMaGiamGia(), nguoiDungId, dongTinhGiam);
            tienGiamGia = kq.getTienGiam();
            maGiamGiaId = kq.getMaGiamGiaId();

            Map<Long, BigDecimal> giamTheoBienThe = kq.getGiamTheoBienThe();
            if ("SAN_PHAM".equals(kq.getLoaiApDung()) && giamTheoBienThe != null) {
                for (ChiTietDonHang ct : chiTietList) {
                    BigDecimal giam = giamTheoBienThe.get(ct.getBienTheId());
                    if (giam != null && giam.signum() > 0) {
                        ct.setMaGiamGiaId(kq.getMaGiamGiaId());
                        ct.setTienGiamSanPham(giam);
                    }
                }
            }
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

        notificationService.taoThongBao(nguoiDungId, NotificationService.LOAI_DON_HANG,
                "Đặt hàng thành công",
                "Đơn hàng " + saved.getMaDonHang() + " đã được tạo và đang chờ xử lý.",
                donHangId);

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

        notificationService.taoThongBao(nguoiDungId, NotificationService.LOAI_DON_HANG,
                "Đã hủy đơn hàng",
                "Đơn hàng " + donHang.getMaDonHang() + " đã được hủy.",
                id);

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

        // Lượt bán chỉ tăng khi đơn thực sự hoàn thành (gộp theo sản phẩm + theo biến thể).
        Map<Long, Integer> soLuongTheoSanPham = new LinkedHashMap<>();
        Map<Long, Integer> soLuongTheoBienThe = new LinkedHashMap<>();
        for (ChiTietDonHang ct : cts) {
            BienTheInfo info = productQueryService.layThongTinBienThe(ct.getBienTheId());
            soLuongTheoSanPham.merge(info.getSanPhamId(), ct.getSoLuong(), Integer::sum);
            if (ct.getBienTheId() != null) {
                soLuongTheoBienThe.merge(ct.getBienTheId(), ct.getSoLuong(), Integer::sum);
            }
        }
        soLuongTheoSanPham.forEach(productQueryService::tangSoLuotBan);
        soLuongTheoBienThe.forEach(productQueryService::tangSoLuotBanBienThe);

        notificationService.taoThongBao(nguoiDungId, NotificationService.LOAI_DON_HANG,
                "Đơn hàng hoàn thành",
                "Cảm ơn bạn! Đơn hàng " + donHang.getMaDonHang()
                        + " đã hoàn thành. Hãy đánh giá sản phẩm để nhận ưu đãi nhé.",
                id);

        DonHang fresh = donHangRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORD_001));
        return toDetailResponse(fresh);
    }

    // ══════════════════════════════════════════════════════════════════
    //  ADMIN — thao tác toàn hệ thống (không lọc theo nguoiDungId).
    //  Chuyển trạng thái đặt ở đây vì service này giữ state machine + hoàn kho/mã.
    // ══════════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public PageResponse<DonHangSummaryResponse> getDanhSachAdmin(
            String trangThai, String search, LocalDate tuNgay, LocalDate denNgay, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        // Lọc theo ngày đặt: [tuNgay 00:00, denNgay+1 00:00) theo múi giờ hệ thống.
        java.time.ZoneId zone = java.time.ZoneId.systemDefault();
        java.time.OffsetDateTime from = tuNgay == null ? null
                : tuNgay.atStartOfDay(zone).toOffsetDateTime();
        java.time.OffsetDateTime to = denNgay == null ? null
                : denNgay.plusDays(1).atStartOfDay(zone).toOffsetDateTime();
        Page<DonHang> result = donHangRepo.timKiemAdmin(
                trangThai == null ? "" : trangThai.trim(),
                search == null ? "" : search.trim(),
                from, to,
                pageable);

        List<DonHang> content = result.getContent();
        // Batch lấy thông tin TÀI KHOẢN người đặt (tránh N+1) để hiển thị ở cột khách hàng.
        Map<Long, NguoiDungInfo> taiKhoanMap = nguoiDungQueryService.layThongTinNhieu(
                content.stream().map(DonHang::getNguoiDungId).distinct().toList());

        List<DonHangSummaryResponse> items = content.stream()
                .map(d -> {
                    DonHangSummaryResponse r = toSummaryResponse(d);
                    NguoiDungInfo tk = taiKhoanMap.get(d.getNguoiDungId());
                    if (tk != null) {
                        r.setTenTaiKhoan(tk.getHoTen());
                        r.setSdtTaiKhoan(tk.getSoDienThoai());
                    }
                    return r;
                })
                .collect(Collectors.toCollection(ArrayList::new));

        return PageResponse.of(items, result.getTotalElements(), result.getTotalPages(), page);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> demTheoTrangThai() {
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] row : donHangRepo.demTheoTrangThai()) {
            map.put((String) row[0], (Long) row[1]);
        }
        return map;
    }

    @Transactional(readOnly = true)
    public DonHangResponse getChiTietAdmin(Long donHangId) {
        DonHang donHang = donHangRepo.findById(donHangId)
                .orElseThrow(() -> new AppException(ErrorCode.ORD_001));
        return toDetailResponse(donHang);
    }

    /** Duyệt đơn: CHO_XU_LY → DA_DUYET. */
    @Transactional
    public DonHangResponse duyetDon(Long donHangId) {
        return chuyenTrangThaiDon(donHangId, "CHO_XU_LY", "DA_DUYET",
                "Quản trị viên đã duyệt đơn, chờ lấy hàng",
                "Đơn hàng đã được duyệt",
                "Đơn hàng %s đã được duyệt và đang chờ lấy hàng.");
    }

    /** Bàn giao đơn vị vận chuyển: DA_DUYET → DANG_GIAO. */
    @Transactional
    public DonHangResponse xacNhanGiao(Long donHangId) {
        return chuyenTrangThaiDon(donHangId, "DA_DUYET", "DANG_GIAO",
                "Đã bàn giao cho đơn vị vận chuyển",
                "Đơn hàng đang được giao",
                "Đơn hàng %s đang trên đường giao đến bạn.");
    }

    /** Giao thành công: DANG_GIAO → GIAO_THANH_CONG (khách tự xác nhận để hoàn thành). */
    @Transactional
    public DonHangResponse hoanTatGiao(Long donHangId) {
        return chuyenTrangThaiDon(donHangId, "DANG_GIAO", "GIAO_THANH_CONG",
                "Đơn vị vận chuyển báo giao thành công",
                "Đơn hàng đã giao thành công",
                "Đơn hàng %s đã giao thành công. Vui lòng xác nhận khi đã nhận hàng.");
    }

    /** Hủy đơn bởi admin (từ CHO_XU_LY / DA_DUYET / DANG_GIAO) + hoàn kho + hoàn lượt mã. */
    @Transactional
    public DonHangResponse huyDonAdmin(Long donHangId, String lyDo) {
        DonHang donHang = donHangRepo.findById(donHangId)
                .orElseThrow(() -> new AppException(ErrorCode.ORD_001));

        String tt = donHang.getTrangThai();
        if (!("CHO_XU_LY".equals(tt) || "DA_DUYET".equals(tt) || "DANG_GIAO".equals(tt))) {
            throw new AppException(ErrorCode.ORD_002);
        }

        Long id = donHang.getId();
        Long nguoiDungId = donHang.getNguoiDungId();
        Long maGiamGiaId = donHang.getMaGiamGiaId();
        List<ChiTietDonHang> cts = new ArrayList<>(donHang.getChiTiet());

        String ghiChu = (lyDo == null || lyDo.isBlank())
                ? "Quản trị viên hủy đơn"
                : "Quản trị viên hủy đơn: " + lyDo.trim();
        donHang.setTrangThai("DA_HUY");
        donHang.themLichSu(LichSuTrangThaiDonHang.builder()
                .trangThai("DA_HUY")
                .ghiChu(ghiChu)
                .build());
        donHangRepo.saveAndFlush(donHang);

        for (ChiTietDonHang ct : cts) {
            productQueryService.hoanTonKho(ct.getBienTheId(), ct.getSoLuong());
        }
        if (maGiamGiaId != null) {
            maGiamGiaService.hoanTraSuDung(maGiamGiaId, id);
        }

        notificationService.taoThongBao(nguoiDungId, NotificationService.LOAI_DON_HANG,
                "Đơn hàng đã bị hủy",
                "Đơn hàng " + donHang.getMaDonHang() + " đã bị hủy. " + ghiChu,
                id);

        DonHang fresh = donHangRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORD_001));
        return toDetailResponse(fresh);
    }

    // Chuyển trạng thái đơn giản (không hoàn kho/mã): kiểm tra trạng thái hiện tại,
    // cập nhật, ghi timeline + thông báo khách.
    private DonHangResponse chuyenTrangThaiDon(
            Long donHangId, String tuTrangThai, String denTrangThai,
            String ghiChuTimeline, String tieuDeThongBao, String mauNoiDungThongBao) {
        DonHang donHang = donHangRepo.findById(donHangId)
                .orElseThrow(() -> new AppException(ErrorCode.ORD_001));

        if (!tuTrangThai.equals(donHang.getTrangThai())) {
            throw new AppException(ErrorCode.ORD_004);
        }

        Long id = donHang.getId();
        Long nguoiDungId = donHang.getNguoiDungId();
        donHang.setTrangThai(denTrangThai);
        donHang.themLichSu(LichSuTrangThaiDonHang.builder()
                .trangThai(denTrangThai)
                .ghiChu(ghiChuTimeline)
                .build());
        donHangRepo.saveAndFlush(donHang);

        notificationService.taoThongBao(nguoiDungId, NotificationService.LOAI_DON_HANG,
                tieuDeThongBao,
                String.format(mauNoiDungThongBao, donHang.getMaDonHang()),
                id);

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
                        .tienGiamSanPham(ct.getTienGiamSanPham())
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
                .hoTenNguoiNhan(d.getHoTenNguoiNhan())
                .soDienThoaiNhan(d.getSoDienThoaiNhan())
                .phuongThucThanhToan(d.getPhuongThucThanhToan())
                .build();
    }
}
