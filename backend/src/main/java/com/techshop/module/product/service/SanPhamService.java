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
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SanPhamService {

    private final SanPhamRepository sanPhamRepo;
    private final BienTheSanPhamRepository bienTheRepo;

    // ─── Danh sách sản phẩm ───────────────────────────────────────────────

    public PageResponse<SanPhamCardResponse> getSanPham(
            Long phanLoaiId, String search,
            BigDecimal minPrice, BigDecimal maxPrice,
            String sortBy, int page, int size) {

        Pageable pageable = buildPageable(sortBy, page, size);
        String searchTrim = (search != null && !search.isBlank()) ? search.trim() : null;

        Page<SanPham> result = sanPhamRepo.findWithFilters(phanLoaiId, searchTrim, minPrice, maxPrice, pageable);
        List<SanPhamCardResponse> items = result.getContent().stream()
                .map(this::toCardResponse)
                .toList();

        return PageResponse.of(items, result.getTotalElements(), result.getTotalPages(), page);
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
                .thongSoKyThuat(sp.getThongSoKyThuat())
                .diemDanhGiaTb(sp.getDiemDanhGiaTb())
                .soLuotDanhGia(sp.getSoLuotDanhGia())
                .soLuotBan(sp.getSoLuotBan())
                .bienThes(bienThes.stream().map(this::toBienTheResponse).toList())
                .sanPhamTuongTu(tuongTu.stream().map(this::toCardResponse).toList())
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
                    .thongSoKyThuat(sp.getThongSoKyThuat())
                    .diemDanhGiaTb(sp.getDiemDanhGiaTb())
                    .soLuotDanhGia(sp.getSoLuotDanhGia())
                    .bienThes(bienThes.stream().map(this::toBienTheResponse).toList())
                    .build();
        }).toList();
    }

    // ─── Ứng cử viên so sánh ─────────────────────────────────────────────

    public List<SanPhamCardResponse> getUngCuSoSanh(Long phanLoaiId, List<Long> loaiTruIds) {
        List<Long> exclude = (loaiTruIds == null || loaiTruIds.isEmpty())
                ? List.of(-1L) : loaiTruIds;
        List<SanPham> candidates = sanPhamRepo.findCompareCandidates(
                phanLoaiId, exclude, PageRequest.of(0, 20));
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
                .orElse(null);

        List<NhanResponse> nhans = bienThes.stream()
                .flatMap(bt -> bt.getNhans().stream())
                .distinct()
                .map(n -> NhanResponse.builder()
                        .id(n.getId()).tenNhan(n.getTenNhan()).mauSac(n.getMauSac()).build())
                .toList();

        return SanPhamCardResponse.builder()
                .id(sp.getId())
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
                .toList();

        Set<NhanResponse> nhans = bt.getNhans().stream()
                .map(n -> NhanResponse.builder()
                        .id(n.getId()).tenNhan(n.getTenNhan()).mauSac(n.getMauSac()).build())
                .collect(Collectors.toSet());

        return BienTheResponse.builder()
                .id(bt.getId())
                .maBienThe(bt.getMaBienThe())
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
                .orElse(null);
    }

    private Pageable buildPageable(String sortBy, int page, int size) {
        // price_asc/price_desc requires subquery sort — use ngayTao as fallback for Phase 3
        Sort sort = switch (sortBy == null ? "" : sortBy) {
            case "rating" -> Sort.by("diemDanhGiaTb").descending();
            case "sold"   -> Sort.by("soLuotBan").descending();
            default       -> Sort.by("ngayTao").descending();
        };
        return PageRequest.of(page, size, sort);
    }
}
