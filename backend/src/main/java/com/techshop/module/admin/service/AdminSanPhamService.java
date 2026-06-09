package com.techshop.module.admin.service;

import com.techshop.module.admin.dto.request.BienTheRequest;
import com.techshop.module.admin.dto.request.BienTheUpsertRequest;
import com.techshop.module.admin.dto.request.SanPhamRequest;
import com.techshop.module.admin.dto.response.AdminBienTheResponse;
import com.techshop.module.admin.dto.response.AdminSanPhamDetailResponse;
import com.techshop.module.admin.dto.response.AdminSanPhamSummaryResponse;
import com.techshop.module.admin.dto.response.FormOptionsResponse;
import com.techshop.module.discount.repository.MaGiamGiaRepository;
import com.techshop.module.order.repository.ChiTietDonHangRepository;
import com.techshop.module.product.entity.*;
import com.techshop.module.product.repository.*;
import com.techshop.module.review.repository.DanhGiaRepository;
import com.techshop.shared.exception.AppException;
import com.techshop.shared.exception.ErrorCode;
import com.techshop.shared.response.PageResponse;
import com.techshop.shared.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * CRUD sản phẩm cho admin. Quản lý san_pham + bien_the_san_pham (specs JSONB) +
 * anh_san_pham (URL) + nhãn (bien_the_nhan). Lọc storefront dùng JSONB nên không cần
 * bảng chuẩn hóa bien_the_gia_tri_thuoc_tinh (thuộc module Thuộc tính — để sau).
 */
@Service
@RequiredArgsConstructor
public class AdminSanPhamService {

    private final SanPhamRepository sanPhamRepo;
    private final BienTheSanPhamRepository bienTheRepo;
    private final AnhSanPhamRepository anhRepo;
    private final NhanSanPhamRepository nhanRepo;
    private final PhanLoaiSanPhamRepository phanLoaiRepo;
    private final ChiTietDonHangRepository chiTietDonHangRepo;
    private final DanhGiaRepository danhGiaRepo;
    private final MaGiamGiaRepository maGiamGiaRepo;

    private static final String CON_HANG = "CON_HANG";

    // ─── Danh sách ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<AdminSanPhamSummaryResponse> getDanhSach(
            String trangThai, String search, Long danhMucId, Long phanLoaiId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SanPham> result = sanPhamRepo.timKiemAdmin(
                trangThai == null ? "" : trangThai.trim(),
                search == null ? "" : search.trim(),
                danhMucId != null, danhMucId,
                phanLoaiId != null, phanLoaiId,
                pageable);

        // Nạp map phân loại → (tên phân loại, tên danh mục) một lần.
        Map<Long, PhanLoaiSanPham> plMap = phanLoaiRepo.findAll().stream()
                .collect(Collectors.toMap(PhanLoaiSanPham::getId, p -> p));

        List<AdminSanPhamSummaryResponse> items = result.getContent().stream()
                .map(sp -> toSummary(sp, plMap))
                .collect(Collectors.toCollection(ArrayList::new));

        return PageResponse.of(items, result.getTotalElements(), result.getTotalPages(), page);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> demTheoTrangThai() {
        Map<String, Long> map = new LinkedHashMap<>();
        for (Object[] row : sanPhamRepo.demTheoTrangThai()) {
            map.put((String) row[0], (Long) row[1]);
        }
        return map;
    }

    @Transactional(readOnly = true)
    public AdminSanPhamDetailResponse getChiTiet(Long id) {
        SanPham sp = sanPhamRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROD_001));
        return toDetail(sp);
    }

    @Transactional(readOnly = true)
    public FormOptionsResponse getFormOptions() {
        List<FormOptionsResponse.PhanLoaiOption> phanLoais = phanLoaiRepo.findAll().stream()
                .map(p -> FormOptionsResponse.PhanLoaiOption.builder()
                        .id(p.getId())
                        .tenPhanLoai(p.getTenPhanLoai())
                        .danhMucId(p.getDanhMuc().getId())
                        .tenDanhMuc(p.getDanhMuc().getTenDanhMuc())
                        .build())
                .sorted(Comparator.comparing(FormOptionsResponse.PhanLoaiOption::getTenDanhMuc)
                        .thenComparing(FormOptionsResponse.PhanLoaiOption::getTenPhanLoai))
                .collect(Collectors.toList());

        List<FormOptionsResponse.NhanOption> nhans = nhanRepo.findAll().stream()
                .map(n -> FormOptionsResponse.NhanOption.builder()
                        .id(n.getId()).tenNhan(n.getTenNhan()).mauSac(n.getMauSac()).build())
                .collect(Collectors.toList());

        return FormOptionsResponse.builder().phanLoais(phanLoais).nhans(nhans).build();
    }

    // ─── Tạo mới ──────────────────────────────────────────────────────────

    @Transactional
    @CacheEvict(value = "san-pham-chi-tiet", allEntries = true)
    public AdminSanPhamDetailResponse taoMoi(SanPhamRequest req) {
        kiemTraPhanLoai(req.getPhanLoaiId());

        SanPham sp = SanPham.builder()
                .tenSanPham(req.getTenSanPham().trim())
                .slug(sinhSlug(req.getTenSanPham(), req.getSlug(), null))
                .moTa(req.getMoTa())
                .moTaNgan(req.getMoTaNgan())
                .phanLoaiId(req.getPhanLoaiId())
                .thuongHieu(req.getThuongHieu())
                .banDoBienThe(new HashMap<>())   // dựng lại sau khi có biến thể
                .trangThai(chuanTrangThaiSp(req.getTrangThai()))
                // Khởi tạo cache field đánh giá = 0 (tránh NULL gây lỗi .toFixed ở FE).
                .diemDanhGiaTb(BigDecimal.ZERO)
                .soLuotDanhGia(0)
                .soLuotBan(0)
                .build();
        SanPham saved = sanPhamRepo.save(sp);

        luuAnhSanPham(saved.getId(), req.getAnhUrls());

        // Biến thể chỉ tạo nếu request có gửi (form hộp chứa không gửi).
        if (req.getBienThes() != null) {
            for (BienTheRequest bt : req.getBienThes()) {
                luuBienTheMoi(saved, bt);
            }
            dongBoBanDoBienThe(saved.getId());
        }
        return toDetail(saved);
    }

    // ─── Cập nhật ─────────────────────────────────────────────────────────

    @Transactional
    @CacheEvict(value = "san-pham-chi-tiet", allEntries = true)
    public AdminSanPhamDetailResponse capNhat(Long id, SanPhamRequest req) {
        SanPham sp = sanPhamRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROD_001));
        kiemTraPhanLoai(req.getPhanLoaiId());

        sp.setTenSanPham(req.getTenSanPham().trim());
        sp.setSlug(sinhSlug(req.getTenSanPham(), req.getSlug(), id));
        sp.setMoTa(req.getMoTa());
        sp.setMoTaNgan(req.getMoTaNgan());
        sp.setPhanLoaiId(req.getPhanLoaiId());
        sp.setThuongHieu(req.getThuongHieu());
        sp.setTrangThai(chuanTrangThaiSp(req.getTrangThai()));
        sanPhamRepo.save(sp);

        // Ảnh cấp sản phẩm: chỉ thay khi request có gửi anhUrls.
        if (req.getAnhUrls() != null) {
            luuAnhSanPham(id, req.getAnhUrls());
        }

        // Biến thể: chỉ đồng bộ khi request có gửi bienThes. null = giữ nguyên (sửa hộp chứa).
        if (req.getBienThes() != null) {
            dongBoBienThe(sp, req.getBienThes());
        }
        return toDetail(sp);
    }

    // Đồng bộ danh sách biến thể (thêm/sửa/xóa) theo request.
    private void dongBoBienThe(SanPham sp, List<BienTheRequest> bienThes) {
        // Biến thể hiện có trong DB (khử trùng vì JOIN FETCH anhs có thể nhân bản).
        List<BienTheSanPham> dbList = new ArrayList<>(
                bienTheRepo.findBySanPhamIdWithDetails(sp.getId()).stream()
                        .collect(Collectors.toMap(BienTheSanPham::getId, b -> b, (a, b) -> a,
                                LinkedHashMap::new))
                        .values());
        Set<Long> reqIds = bienThes.stream()
                .map(BienTheRequest::getId).filter(Objects::nonNull).collect(Collectors.toSet());

        // Xóa biến thể bị loại bỏ (chặn nếu đã có đơn).
        for (BienTheSanPham db : dbList) {
            if (!reqIds.contains(db.getId())) {
                if (chiTietDonHangRepo.existsByBienTheIdIn(List.of(db.getId()))) {
                    throw new AppException(ErrorCode.PROD_005);
                }
                anhRepo.deleteByBienTheId(db.getId());
                bienTheRepo.delete(db);
            }
        }

        // Upsert biến thể từ request.
        for (BienTheRequest bt : bienThes) {
            if (bt.getId() == null) {
                luuBienTheMoi(sp, bt);
            } else {
                BienTheSanPham existing = bienTheRepo.findById(bt.getId())
                        .orElseThrow(() -> new AppException(ErrorCode.PROD_002));
                apDungBienThe(existing, bt);
                bienTheRepo.save(existing);
                luuAnh(sp.getId(), existing.getId(), bt.getAnhUrls());
            }
        }
        dongBoBanDoBienThe(sp.getId());
    }

    // ─── Ẩn / hiện (đổi trạng thái) ───────────────────────────────────────

    @Transactional
    @CacheEvict(value = "san-pham-chi-tiet", allEntries = true)
    public void doiTrangThai(Long id, String trangThai) {
        SanPham sp = sanPhamRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROD_001));
        sp.setTrangThai(chuanTrangThaiSp(trangThai));
        sanPhamRepo.save(sp);
    }

    // ─── Xóa (cứng nếu chưa có đơn/đánh giá, ngược lại mềm = NGUNG_BAN) ────

    @Transactional
    @CacheEvict(value = "san-pham-chi-tiet", allEntries = true)
    public void xoa(Long id) {
        SanPham sp = sanPhamRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROD_001));

        List<BienTheSanPham> variants = new ArrayList<>(
                bienTheRepo.findBySanPhamIdWithDetails(id).stream()
                        .collect(Collectors.toMap(BienTheSanPham::getId, b -> b, (a, b) -> a,
                                LinkedHashMap::new))
                        .values());
        List<Long> bienTheIds = variants.stream().map(BienTheSanPham::getId).toList();
        boolean coDon = !bienTheIds.isEmpty() && chiTietDonHangRepo.existsByBienTheIdIn(bienTheIds);
        boolean coDanhGia = danhGiaRepo.existsBySanPhamId(id);

        if (coDon || coDanhGia) {
            // Xóa mềm: ẩn khỏi cửa hàng nhưng giữ dữ liệu lịch sử.
            sp.setTrangThai("NGUNG_BAN");
            sanPhamRepo.save(sp);
            return;
        }

        // Xóa cứng: ảnh → biến thể → sản phẩm.
        for (BienTheSanPham bt : variants) {
            anhRepo.deleteByBienTheId(bt.getId());
            bienTheRepo.delete(bt);
        }
        anhRepo.deleteBySanPhamId(id);
        sanPhamRepo.delete(sp);
    }

    // ─── Thao tác từng biến thể ───────────────────────────────────────────

    @Transactional
    @CacheEvict(value = "san-pham-chi-tiet", allEntries = true)
    public void doiTrangThaiBienThe(Long bienTheId, String trangThai) {
        BienTheSanPham bt = bienTheRepo.findById(bienTheId)
                .orElseThrow(() -> new AppException(ErrorCode.PROD_002));
        bt.setTrangThai(chuanTrangThaiBienThe(trangThai));
        bienTheRepo.save(bt);
    }

    @Transactional
    @CacheEvict(value = "san-pham-chi-tiet", allEntries = true)
    public void xoaBienThe(Long bienTheId) {
        BienTheSanPham bt = bienTheRepo.findById(bienTheId)
                .orElseThrow(() -> new AppException(ErrorCode.PROD_002));
        Long sanPhamId = bt.getSanPham().getId();
        boolean laMacDinh = Boolean.TRUE.equals(bt.getLaBienTheMacDinh());
        // Biến thể đã phát sinh đơn → không xóa (admin nên ẩn thay vì xóa).
        if (chiTietDonHangRepo.existsByBienTheIdIn(List.of(bienTheId))) {
            throw new AppException(ErrorCode.PROD_005);
        }
        anhRepo.deleteByBienTheId(bienTheId);
        bienTheRepo.delete(bt);

        // Xóa biến thể mặc định → phong biến thể còn lại đầu tiên làm mặc định (giữ đúng 1 mặc định).
        if (laMacDinh) {
            bienTheRepo.findBySanPhamIdWithDetails(sanPhamId).stream()
                    .findFirst()
                    .ifPresent(con -> {
                        con.setLaBienTheMacDinh(true);
                        bienTheRepo.save(con);
                    });
        }
        dongBoBanDoBienThe(sanPhamId);
    }

    @Transactional
    @CacheEvict(value = "san-pham-chi-tiet", allEntries = true)
    public void themBienThe(Long sanPhamId, BienTheUpsertRequest req) {
        SanPham sp = sanPhamRepo.findById(sanPhamId)
                .orElseThrow(() -> new AppException(ErrorCode.PROD_001));

        // Biến thể ĐẦU TIÊN của sản phẩm tự động là mặc định; các biến thể thêm sau = false.
        // (Form thêm không còn ô chọn mặc định — hệ thống tự quyết định.)
        boolean laMacDinh = bienTheRepo.countBySanPhamId(sanPhamId) == 0;

        Map<String, Object> specs = stripMau(req.getThongSoBienThe());
        String mau = rong(req.getMauSac()) ? null : req.getMauSac().trim();
        BienTheSanPham bt = BienTheSanPham.builder()
                .sanPham(sp)
                .phanLoaiId(sp.getPhanLoaiId())
                .tenBienThe(sinhTenBienThe(specs, mau))   // tên tự sinh = thông số + màu
                .mauSac(mau)
                .thongSoBienThe(specs)
                .gia(req.getGia())
                .giaKhuyenMai(tinhGiaKhuyenMai(req.getGia(), req.getGiaBan()))
                .soLuongTon(req.getSoLuongTon())
                .trangThai(CON_HANG)
                .laBienTheMacDinh(laMacDinh)
                .build();
        bienTheRepo.save(bt);
        dongBoBanDoBienThe(sanPhamId);
    }

    @Transactional
    @CacheEvict(value = "san-pham-chi-tiet", allEntries = true)
    public void suaBienThe(Long bienTheId, BienTheUpsertRequest req) {
        BienTheSanPham bt = bienTheRepo.findById(bienTheId)
                .orElseThrow(() -> new AppException(ErrorCode.PROD_002));
        Long sanPhamId = bt.getSanPham().getId();

        Map<String, Object> specs = stripMau(req.getThongSoBienThe());
        String mau = rong(req.getMauSac()) ? null : req.getMauSac().trim();
        bt.setTenBienThe(sinhTenBienThe(specs, mau));   // tên tự sinh = thông số + màu
        bt.setMauSac(mau);
        bt.setThongSoBienThe(specs);
        bt.setGia(req.getGia());
        bt.setGiaKhuyenMai(tinhGiaKhuyenMai(req.getGia(), req.getGiaBan()));
        bt.setSoLuongTon(req.getSoLuongTon());
        bt.setLaBienTheMacDinh(req.isLaMacDinh());

        // Đặt mặc định → bỏ cờ các biến thể khác (clear context), rồi save merge lại biến thể này.
        if (req.isLaMacDinh()) {
            bienTheRepo.boMacDinhTatCa(sanPhamId);
        }
        bienTheRepo.save(bt);
        dongBoBanDoBienThe(sanPhamId);
    }

    private BigDecimal tinhGiaKhuyenMai(BigDecimal gia, BigDecimal giaBan) {
        // Giá bán chỉ là "khuyến mãi" khi thực sự thấp hơn niêm yết; bằng/cao hơn → không khuyến mãi.
        return (giaBan != null && gia != null && giaBan.compareTo(gia) < 0) ? giaBan : null;
    }

    private boolean rong(String s) {
        return s == null || s.isBlank();
    }

    // Loại các key màu khỏi thông số biến thể (màu đã tách sang cột mau_sac).
    private Map<String, Object> stripMau(Map<String, Object> specs) {
        if (specs == null) return new HashMap<>();
        Map<String, Object> m = new LinkedHashMap<>(specs);
        m.keySet().removeAll(List.of("color", "mau_sac", "mauSac", "Màu sắc"));
        return m;
    }

    // Chuỗi thông số = các value nối bằng " / " (sắp theo key). Khớp string_agg trong V14.
    private String buildChuoiThongSo(Map<String, Object> specs) {
        if (specs == null || specs.isEmpty()) return "";
        return specs.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> String.valueOf(e.getValue()))
                .collect(Collectors.joining(" / "));
    }

    // Tên biến thể tự sinh = chuỗi thông số + màu, VD "Intel Core i5 / 8GB / 512GB / Bạc".
    private String sinhTenBienThe(Map<String, Object> specs, String mauSac) {
        String chuoi = buildChuoiThongSo(specs);
        if (mauSac != null && !mauSac.isBlank()) {
            chuoi = chuoi.isBlank() ? mauSac.trim() : chuoi + " / " + mauSac.trim();
        }
        return chuoi.isBlank() ? null : chuoi;
    }

    // Dựng lại san_pham.ban_do_bien_the = { chuỗi thông số: { màu: id biến thể } } từ toàn bộ biến thể.
    private void dongBoBanDoBienThe(Long sanPhamId) {
        SanPham sp = sanPhamRepo.findById(sanPhamId)
                .orElseThrow(() -> new AppException(ErrorCode.PROD_001));
        List<BienTheSanPham> bts = new ArrayList<>(
                bienTheRepo.findBySanPhamIdWithDetails(sanPhamId).stream()
                        .collect(Collectors.toMap(BienTheSanPham::getId, b -> b, (a, b) -> a,
                                LinkedHashMap::new))
                        .values());
        Map<String, Object> map = new LinkedHashMap<>();
        for (BienTheSanPham bt : bts) {
            String spec = buildChuoiThongSo(bt.getThongSoBienThe());
            String mau = rong(bt.getMauSac()) ? "—" : bt.getMauSac();
            @SuppressWarnings("unchecked")
            Map<String, Object> colorMap = (Map<String, Object>)
                    map.computeIfAbsent(spec, k -> new LinkedHashMap<String, Object>());
            colorMap.put(mau, bt.getId());
        }
        sp.setBanDoBienThe(map);
        sanPhamRepo.save(sp);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    private void kiemTraPhanLoai(Long phanLoaiId) {
        if (!phanLoaiRepo.existsById(phanLoaiId)) {
            throw new AppException(ErrorCode.PROD_006);
        }
    }

    private String chuanTrangThaiSp(String tt) {
        if (tt == null || tt.isBlank()) return CON_HANG;
        return switch (tt) {
            case "CON_HANG", "HET_HANG", "NGUNG_BAN", "BAN_NHAP" -> tt;
            default -> CON_HANG;
        };
    }

    private String chuanTrangThaiBienThe(String tt) {
        if (tt == null || tt.isBlank()) return CON_HANG;
        return switch (tt) {
            case "CON_HANG", "HET_HANG", "NGUNG_BAN" -> tt;
            default -> CON_HANG;
        };
    }

    private String sinhSlug(String ten, String slugReq, Long idHienTai) {
        String base = (slugReq != null && !slugReq.isBlank())
                ? SlugUtil.toSlug(slugReq) : SlugUtil.toSlug(ten);
        if (base.isBlank()) base = "san-pham";
        String slug = base;
        int i = 2;
        while (idHienTai == null
                ? sanPhamRepo.existsBySlug(slug)
                : sanPhamRepo.existsBySlugAndIdNot(slug, idHienTai)) {
            slug = base + "-" + i++;
        }
        return slug;
    }

    private void luuBienTheMoi(SanPham sp, BienTheRequest bt) {
        BienTheSanPham bienThe = BienTheSanPham.builder()
                .sanPham(sp)
                .maBienThe(bt.getMaBienThe() == null || bt.getMaBienThe().isBlank() ? null : bt.getMaBienThe().trim())
                .thongSoBienThe(bt.getThongSoBienThe() == null ? new HashMap<>() : bt.getThongSoBienThe())
                .gia(bt.getGia())
                .giaKhuyenMai(bt.getGiaKhuyenMai())
                .soLuongTon(bt.getSoLuongTon())
                .trangThai(chuanTrangThaiBienThe(bt.getTrangThai()))
                .nhans(taiNhan(bt.getNhanIds()))
                .build();
        BienTheSanPham saved = bienTheRepo.save(bienThe);
        luuAnh(sp.getId(), saved.getId(), bt.getAnhUrls());
    }

    private void apDungBienThe(BienTheSanPham bienThe, BienTheRequest bt) {
        bienThe.setMaBienThe(bt.getMaBienThe() == null || bt.getMaBienThe().isBlank() ? null : bt.getMaBienThe().trim());
        bienThe.setThongSoBienThe(bt.getThongSoBienThe() == null ? new HashMap<>() : bt.getThongSoBienThe());
        bienThe.setGia(bt.getGia());
        bienThe.setGiaKhuyenMai(bt.getGiaKhuyenMai());
        bienThe.setSoLuongTon(bt.getSoLuongTon());
        bienThe.setTrangThai(chuanTrangThaiBienThe(bt.getTrangThai()));
        bienThe.getNhans().clear();
        bienThe.getNhans().addAll(taiNhan(bt.getNhanIds()));
    }

    private Set<NhanSanPham> taiNhan(List<Long> nhanIds) {
        if (nhanIds == null || nhanIds.isEmpty()) return new HashSet<>();
        return new HashSet<>(nhanRepo.findAllById(nhanIds));
    }

    // Thay toàn bộ ảnh của biến thể: xóa cũ → chèn mới (ảnh đầu = ảnh chính).
    private void luuAnh(Long sanPhamId, Long bienTheId, List<String> urls) {
        anhRepo.deleteByBienTheId(bienTheId);
        if (urls == null) return;
        int thuTu = 1;
        for (String url : urls) {
            if (url == null || url.isBlank()) continue;
            anhRepo.save(AnhSanPham.builder()
                    .sanPhamId(sanPhamId)
                    .bienTheId(bienTheId)
                    .urlAnh(url.trim())
                    .laAnhChinh(thuTu == 1)
                    .thuTu(thuTu)
                    .build());
            thuTu++;
        }
    }

    // Thay toàn bộ ảnh CẤP SẢN PHẨM (bien_the_id = NULL).
    private void luuAnhSanPham(Long sanPhamId, List<String> urls) {
        anhRepo.deleteBySanPhamIdAndBienTheIdIsNull(sanPhamId);
        if (urls == null) return;
        int thuTu = 1;
        for (String url : urls) {
            if (url == null || url.isBlank()) continue;
            anhRepo.save(AnhSanPham.builder()
                    .sanPhamId(sanPhamId)
                    .bienTheId(null)
                    .urlAnh(url.trim())
                    .laAnhChinh(thuTu == 1)
                    .thuTu(thuTu)
                    .build());
            thuTu++;
        }
    }

    private AdminSanPhamSummaryResponse toSummary(SanPham sp, Map<Long, PhanLoaiSanPham> plMap) {
        List<BienTheSanPham> bts = sp.getBienThes();
        BigDecimal giaThap = null, giaCao = null;
        int tongTon = 0;
        Set<String> nhanSet = new LinkedHashSet<>();
        String anhChinh = null;
        List<AdminSanPhamSummaryResponse.BienTheDong> bienTheDongs = new ArrayList<>();

        for (BienTheSanPham bt : bts) {
            BigDecimal gia = bt.getGiaKhuyenMai() != null ? bt.getGiaKhuyenMai() : bt.getGia();
            if (gia != null) {
                if (giaThap == null || gia.compareTo(giaThap) < 0) giaThap = gia;
                if (giaCao == null || gia.compareTo(giaCao) > 0) giaCao = gia;
            }
            tongTon += bt.getSoLuongTon();
            bt.getNhans().forEach(n -> nhanSet.add(n.getTenNhan()));
            String anhBt = bt.getAnhs().stream()
                    .filter(AnhSanPham::isLaAnhChinh)
                    .map(AnhSanPham::getUrlAnh)
                    .findFirst()
                    .orElseGet(() -> bt.getAnhs().stream().map(AnhSanPham::getUrlAnh).findFirst().orElse(null));
            if (anhChinh == null) anhChinh = anhBt;

            bienTheDongs.add(AdminSanPhamSummaryResponse.BienTheDong.builder()
                    .id(bt.getId())
                    .maBienThe(bt.getMaBienThe())
                    .tenBienThe(bt.getTenBienThe())
                    .mauSac(bt.getMauSac())
                    .soLuotBan(bt.getSoLuotBan())
                    .laMacDinh(Boolean.TRUE.equals(bt.getLaBienTheMacDinh()))
                    .thongSoBienThe(bt.getThongSoBienThe())
                    .gia(bt.getGia())
                    .giaKhuyenMai(bt.getGiaKhuyenMai())
                    .soLuongTon(bt.getSoLuongTon())
                    .trangThai(bt.getTrangThai())
                    .anhChinh(anhBt)
                    .build());
        }

        // Hộp chứa chưa có biến thể (hoặc biến thể chưa có ảnh) → dùng ảnh cấp sản phẩm.
        if (anhChinh == null) {
            anhChinh = anhRepo.findBySanPhamIdAndBienTheIdIsNullOrderByThuTuAsc(sp.getId())
                    .stream().map(AnhSanPham::getUrlAnh).findFirst().orElse(null);
        }

        PhanLoaiSanPham pl = plMap.get(sp.getPhanLoaiId());
        return AdminSanPhamSummaryResponse.builder()
                .id(sp.getId())
                .tenSanPham(sp.getTenSanPham())
                .slug(sp.getSlug())
                .thuongHieu(sp.getThuongHieu())
                .phanLoaiId(sp.getPhanLoaiId())
                .tenPhanLoai(pl == null ? null : pl.getTenPhanLoai())
                .tenDanhMuc(pl == null ? null : pl.getDanhMuc().getTenDanhMuc())
                .anhChinh(anhChinh)
                .giaThap(giaThap)
                .giaCao(giaCao)
                .tongTon(tongTon)
                .soBienThe(bts.size())
                .trangThai(sp.getTrangThai())
                .nhans(new ArrayList<>(nhanSet))
                .bienThes(bienTheDongs)
                .build();
    }

    private AdminSanPhamDetailResponse toDetail(SanPham sp) {
        // JOIN FETCH anhs có thể nhân bản biến thể (nhiều ảnh) → khử trùng theo id.
        List<BienTheSanPham> bts = new ArrayList<>(
                bienTheRepo.findBySanPhamIdWithDetails(sp.getId()).stream()
                        .collect(Collectors.toMap(BienTheSanPham::getId, b -> b, (a, b) -> a,
                                LinkedHashMap::new))
                        .values());
        List<AdminBienTheResponse> bienThes = bts.stream()
                .map(bt -> AdminBienTheResponse.builder()
                        .id(bt.getId())
                        .maBienThe(bt.getMaBienThe())
                        .tenBienThe(bt.getTenBienThe())
                        .mauSac(bt.getMauSac())
                        .soLuotBan(bt.getSoLuotBan())
                        .laMacDinh(Boolean.TRUE.equals(bt.getLaBienTheMacDinh()))
                        .thongSoBienThe(bt.getThongSoBienThe())
                        .gia(bt.getGia())
                        .giaKhuyenMai(bt.getGiaKhuyenMai())
                        .soLuongTon(bt.getSoLuongTon())
                        .trangThai(bt.getTrangThai())
                        .anhUrls(anhRepo.findByBienTheIdOrderByThuTuAsc(bt.getId()).stream()
                                .map(AnhSanPham::getUrlAnh).collect(Collectors.toList()))
                        .nhanIds(bt.getNhans().stream().map(NhanSanPham::getId).collect(Collectors.toList()))
                        .nhanTens(bt.getNhans().stream().map(NhanSanPham::getTenNhan).collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());

        PhanLoaiSanPham pl = phanLoaiRepo.findById(sp.getPhanLoaiId()).orElse(null);
        List<AdminSanPhamDetailResponse.VoucherItem> vouchers =
                maGiamGiaRepo.findApDungChoSanPham(sp.getId()).stream()
                        .map(m -> AdminSanPhamDetailResponse.VoucherItem.builder()
                                .maCode(m.getMaCode()).tenMa(m.getTenMa()).build())
                        .collect(Collectors.toList());

        return AdminSanPhamDetailResponse.builder()
                .id(sp.getId())
                .tenSanPham(sp.getTenSanPham())
                .slug(sp.getSlug())
                .moTa(sp.getMoTa())
                .moTaNgan(sp.getMoTaNgan())
                .phanLoaiId(sp.getPhanLoaiId())
                .tenPhanLoai(pl == null ? null : pl.getTenPhanLoai())
                .tenDanhMuc(pl == null ? null : pl.getDanhMuc().getTenDanhMuc())
                .thuongHieu(sp.getThuongHieu())
                .trangThai(sp.getTrangThai())
                .diemDanhGiaTb(sp.getDiemDanhGiaTb())
                .soLuotDanhGia(sp.getSoLuotDanhGia())
                .soLuotBan(sp.getSoLuotBan())
                .ngayTao(sp.getNgayTao())
                .ngayCapNhat(sp.getNgayCapNhat())
                .anhUrls(anhRepo.findBySanPhamIdAndBienTheIdIsNullOrderByThuTuAsc(sp.getId())
                        .stream().map(AnhSanPham::getUrlAnh).collect(Collectors.toList()))
                .bienThes(bienThes)
                .vouchers(vouchers)
                .build();
    }
}
