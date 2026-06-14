package com.techshop.module.product.service;

import com.techshop.module.product.dto.response.*;
import com.techshop.module.product.entity.AnhSanPham;
import com.techshop.module.product.entity.BienTheSanPham;
import com.techshop.module.product.entity.SanPham;
import com.techshop.module.product.repository.BienTheSanPhamRepository;
import com.techshop.module.product.repository.SanPhamRepository;
import com.techshop.shared.exception.AppException;
import com.techshop.shared.exception.ErrorCode;
import com.techshop.shared.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SanPhamService {

    private final SanPhamRepository sanPhamRepo;
    private final BienTheSanPhamRepository bienTheRepo;
    private final com.techshop.module.flashsale.service.FlashSaleQueryService flashSaleQueryService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    // ─── Danh sách sản phẩm ───────────────────────────────────────────────

    public PageResponse<BienTheCardResponse> getSanPham(
            Long phanLoaiId, String search,
            BigDecimal minPrice, BigDecimal maxPrice,
            String sortBy, String thongSo, boolean khuyenMai, String nhanMa, int page, int size) {

        // Sort nhúng trong native query → pageable chỉ dùng cho limit/offset (unsorted).
        Pageable pageable = PageRequest.of(page, size);
        // Pattern đã lowercase + bọc %...% để khớp với LIKE :search trong query.
        String searchPattern = (search != null && !search.isBlank())
                ? "%" + search.trim().toLowerCase() + "%"
                : null;
        // Chuẩn hóa chuỗi JSON tiêu chí lọc; null nếu rỗng/không hợp lệ (→ bỏ lọc tiêu chí).
        String thongSoJson = normalizeThongSo(thongSo);
        String nhan = (nhanMa != null && !nhanMa.isBlank()) ? nhanMa.trim() : null;
        String sort = (sortBy == null || sortBy.isBlank()) ? "newest" : sortBy;

        Page<BienTheSanPham> result = bienTheRepo.findBienTheCards(
                phanLoaiId, searchPattern, minPrice, maxPrice, khuyenMai ? 1 : 0, thongSoJson, nhan, sort, pageable);

        // Batch giá flash sale cho cả trang trong 1 truy vấn (tránh N+1 mỗi card 1 query).
        List<BienTheSanPham> content = result.getContent();
        Map<Long, BigDecimal> flashMap = flashSaleQueryService.giaFlashSaleConHieuLuc(
                content.stream().map(BienTheSanPham::getId).toList());

        List<BienTheCardResponse> items = content.stream()
                .map(bt -> toBienTheCardResponse(bt, flashMap))
                .collect(Collectors.toCollection(ArrayList::new));

        return PageResponse.of(items, result.getTotalElements(), result.getTotalPages(), page);
    }

    // Map 1 biến thể → card (1 biến thể = 1 card). Lazy-load sanPham/anhs/nhans trong transaction.
    private BienTheCardResponse toBienTheCardResponse(BienTheSanPham bt, Map<Long, BigDecimal> flashMap) {
        SanPham sp = bt.getSanPham();
        BigDecimal gia = bt.getGia();
        // Giá bán = giá flash nếu biến thể đang flash sale, ngược lại giaKhuyenMai ?? gia.
        BigDecimal giaFlash = flashMap.get(bt.getId());
        boolean laFlashSale = giaFlash != null;
        BigDecimal giaBan = laFlashSale ? giaFlash : (bt.getGiaKhuyenMai() != null ? bt.getGiaKhuyenMai() : gia);
        int phanTram = 0;
        if (gia != null && gia.signum() > 0 && giaBan.compareTo(gia) < 0) {
            phanTram = gia.subtract(giaBan)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(gia, 0, java.math.RoundingMode.HALF_UP)
                    .intValue();
        }

        String anhChinh = bt.getAnhs().stream()
                .filter(AnhSanPham::isLaAnhChinh)
                .map(AnhSanPham::getUrlAnh)
                .findFirst()
                .orElseGet(() -> bt.getAnhs().stream().map(AnhSanPham::getUrlAnh).findFirst()
                        .orElse(sp.getAnhDaiDien()));

        List<NhanResponse> nhans = bt.getNhans().stream()
                .map(n -> NhanResponse.builder()
                        .id(n.getId()).tenNhan(n.getTenNhan()).mauSac(n.getMauSac()).build())
                .collect(Collectors.toCollection(ArrayList::new));

        return BienTheCardResponse.builder()
                .bienTheId(bt.getId())
                .sanPhamId(sp.getId())
                .slug(sp.getSlug())
                // Tên SP + thương hiệu lấy thẳng từ biến thể (denormalized) — không phụ thuộc bảng san_pham.
                .tenSanPham(bt.getTenSanPham() != null ? bt.getTenSanPham() : sp.getTenSanPham())
                .thuongHieu(bt.getThuongHieu() != null ? bt.getThuongHieu() : sp.getThuongHieu())
                .tenBienThe(bt.getTenBienThe())
                .mauSac(bt.getMauSac())
                .trangThai(bt.getTrangThai())
                .thongSoBienThe(bt.getThongSoBienThe())
                .anhChinh(anhChinh)
                .gia(gia)
                .giaBan(giaBan)
                .phanTramGiam(phanTram)
                .flashSale(laFlashSale)
                .diemDanhGiaTb(sp.getDiemDanhGiaTb())
                .soLuotDanhGia(sp.getSoLuotDanhGia())
                .nhans(nhans)
                .build();
    }

    /**
     * Validate + chuẩn hóa chuỗi JSON tiêu chí (vd {"ram":"16GB"}). Trả null nếu rỗng,
     * không phải object, hoặc JSON sai → khi đó query bỏ qua điều kiện lọc tiêu chí.
     */
    private String normalizeThongSo(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            com.fasterxml.jackson.databind.JsonNode node = objectMapper.readTree(json);
            if (!node.isObject() || node.isEmpty()) return null;
            return objectMapper.writeValueAsString(node);
        } catch (Exception e) {
            return null;
        }
    }

    // ─── Chi tiết sản phẩm ───────────────────────────────────────────────

    @Cacheable(value = "san-pham-chi-tiet", key = "#slug")
    public SanPhamDetailResponse getChiTiet(String slug) {
        SanPham sp = sanPhamRepo.findBySlugAndTrangThai(slug, "CON_HANG")
                .orElseThrow(() -> new AppException(ErrorCode.PROD_001));

        List<BienTheSanPham> bienThes = bienTheRepo.findBySanPhamIdWithDetails(sp.getId());

        List<SanPham> tuongTu = sanPhamRepo.findSimilarProducts(
                sp.getPhanLoaiId(), List.of(sp.getId()), PageRequest.of(0, 5));

        return SanPhamDetailResponse.builder()
                .id(sp.getId())
                .slug(sp.getSlug())
                .tenSanPham(sp.getTenSanPham())
                .moTa(sp.getMoTa())
                .moTaNgan(sp.getMoTaNgan())
                .thuongHieu(sp.getThuongHieu())
                .phanLoaiId(sp.getPhanLoaiId())
                .banDoBienThe(sp.getBanDoBienThe())
                .diemDanhGiaTb(sp.getDiemDanhGiaTb())
                .soLuotDanhGia(sp.getSoLuotDanhGia())
                .soLuotBan(sp.getSoLuotBan())
                .bienThes(bienThes.stream().map(this::toBienTheResponse)
                        .collect(Collectors.toCollection(ArrayList::new)))
                .sanPhamTuongTu(tuongTu.stream().map(this::toCardResponse)
                        .collect(Collectors.toCollection(ArrayList::new)))
                .build();
    }

    // ─── Gợi ý tìm kiếm ──────────────────────────────────────────────────

    public List<SuggestResponse> getSuggest(String q) {
        if (q == null || q.isBlank()) return Collections.emptyList();
        List<SanPham> results = sanPhamRepo.findSuggest(q.trim(), PageRequest.of(0, 5));
        return results.stream().map(sp -> {
            BigDecimal giaThap = getGiaThap(sp);
            String anh = getAnhChinh(sp);
            return SuggestResponse.builder()
                    .id(sp.getId())
                    .slug(sp.getSlug())
                    .tenSanPham(sp.getTenSanPham())
                    .anhChinh(anh)
                    .giaThap(giaThap)
                    .build();
        }).toList();
    }

    // ─── So sánh sản phẩm ────────────────────────────────────────────────

    public List<SanPhamDetailResponse> getSoSanh(List<Long> ids) {
        if (ids == null || ids.isEmpty() || ids.size() > 3) {
            throw new AppException(ErrorCode.PROD_003);
        }
        List<SanPham> products = sanPhamRepo.findByIds(ids);
        // Validate cùng phân loại
        boolean samePhanLoai = products.stream()
                .map(SanPham::getPhanLoaiId)
                .distinct().count() == 1;
        if (!samePhanLoai) throw new AppException(ErrorCode.PROD_003);

        return products.stream().map(sp -> {
            List<BienTheSanPham> bienThes = bienTheRepo.findBySanPhamIdWithDetails(sp.getId());
            return SanPhamDetailResponse.builder()
                    .id(sp.getId())
                    .slug(sp.getSlug())
                    .tenSanPham(sp.getTenSanPham())
                    .thuongHieu(sp.getThuongHieu())
                    .phanLoaiId(sp.getPhanLoaiId())
                    .banDoBienThe(sp.getBanDoBienThe())
                    .diemDanhGiaTb(sp.getDiemDanhGiaTb())
                    .soLuotDanhGia(sp.getSoLuotDanhGia())
                    .bienThes(bienThes.stream().map(this::toBienTheResponse).toList())
                    .build();
        }).toList();
    }

    // ─── Ứng cử viên so sánh ─────────────────────────────────────────────

    public List<SanPhamCardResponse> getUngCuSoSanh(Long phanLoaiId, List<Long> loaiTruIds, String search) {
        List<Long> exclude = (loaiTruIds == null || loaiTruIds.isEmpty())
                ? List.of(-1L) : loaiTruIds;
        // "" = khớp tất cả; tránh truyền tham số null vào LIKE (PostgreSQL không suy được kiểu).
        String tuKhoa = (search == null) ? "" : search.trim();
        PageRequest top20 = PageRequest.of(0, 20);
        // phanLoaiId null = lượt chọn đầu tiên (toàn bộ cửa hàng); có = chỉ SP tương quan cùng phân loại.
        List<SanPham> candidates = (phanLoaiId == null)
                ? sanPhamRepo.findCompareCandidatesAll(exclude, tuKhoa, top20)
                : sanPhamRepo.findCompareCandidates(phanLoaiId, exclude, tuKhoa, top20);
        return candidates.stream().map(this::toCardResponse).toList();
    }

    // ─── Mapping helpers ──────────────────────────────────────────────────

    private SanPhamCardResponse toCardResponse(SanPham sp) {
        List<BienTheSanPham> bienThes = sp.getBienThes().stream()
                .filter(bt -> "CON_HANG".equals(bt.getTrangThai()))
                .toList();

        BigDecimal giaThap = bienThes.stream()
                .map(bt -> bt.getGiaKhuyenMai() != null ? bt.getGiaKhuyenMai() : bt.getGia())
                .min(Comparator.naturalOrder())
                .orElse(null);

        BigDecimal giaCao = bienThes.stream()
                .map(bt -> bt.getGiaKhuyenMai() != null ? bt.getGiaKhuyenMai() : bt.getGia())
                .max(Comparator.naturalOrder())
                .orElse(null);

        String anhChinh = bienThes.stream()
                .flatMap(bt -> bt.getAnhs().stream())
                .filter(AnhSanPham::isLaAnhChinh)
                .map(AnhSanPham::getUrlAnh)
                .findFirst()
                .orElse(sp.getAnhDaiDien());

        List<NhanResponse> nhans = bienThes.stream()
                .flatMap(bt -> bt.getNhans().stream())
                .distinct()
                .map(n -> NhanResponse.builder()
                        .id(n.getId()).tenNhan(n.getTenNhan()).mauSac(n.getMauSac()).build())
                .collect(Collectors.toCollection(ArrayList::new));

        return SanPhamCardResponse.builder()
                .id(sp.getId())
                .phanLoaiId(sp.getPhanLoaiId())
                .slug(sp.getSlug())
                .tenSanPham(sp.getTenSanPham())
                .moTaNgan(sp.getMoTaNgan())
                .thuongHieu(sp.getThuongHieu())
                .giaThap(giaThap)
                .giaCao(giaCao)
                .diemDanhGiaTb(sp.getDiemDanhGiaTb())
                .soLuotDanhGia(sp.getSoLuotDanhGia())
                .anhChinh(anhChinh)
                .nhans(nhans)
                .build();
    }

    private BienTheResponse toBienTheResponse(BienTheSanPham bt) {
        List<AnhResponse> anhs = bt.getAnhs().stream()
                .sorted(Comparator.comparingInt(a -> (a.getThuTu() == null ? 0 : a.getThuTu())))
                .map(a -> AnhResponse.builder()
                        .id(a.getId()).urlAnh(a.getUrlAnh())
                        .laAnhChinh(a.isLaAnhChinh()).thuTu(a.getThuTu()).build())
                .collect(Collectors.toCollection(ArrayList::new));

        Set<NhanResponse> nhans = bt.getNhans().stream()
                .map(n -> NhanResponse.builder()
                        .id(n.getId()).tenNhan(n.getTenNhan()).mauSac(n.getMauSac()).build())
                .collect(Collectors.toSet());

        return BienTheResponse.builder()
                .id(bt.getId())
                .maBienThe(bt.getMaBienThe())
                .tenBienThe(bt.getTenBienThe())
                .mauSac(bt.getMauSac())
                .thongSoBienThe(bt.getThongSoBienThe())
                .gia(bt.getGia())
                .giaKhuyenMai(bt.getGiaKhuyenMai())
                .soLuongTon(bt.getSoLuongTon())
                .trangThai(bt.getTrangThai())
                .anhs(anhs)
                .nhans(nhans)
                .build();
    }

    private BigDecimal getGiaThap(SanPham sp) {
        return sp.getBienThes().stream()
                .filter(bt -> "CON_HANG".equals(bt.getTrangThai()))
                .map(bt -> bt.getGiaKhuyenMai() != null ? bt.getGiaKhuyenMai() : bt.getGia())
                .min(Comparator.naturalOrder())
                .orElse(null);
    }

    private String getAnhChinh(SanPham sp) {
        return sp.getBienThes().stream()
                .flatMap(bt -> bt.getAnhs().stream())
                .filter(AnhSanPham::isLaAnhChinh)
                .map(AnhSanPham::getUrlAnh)
                .findFirst()
                .orElse(sp.getAnhDaiDien());
    }

}
