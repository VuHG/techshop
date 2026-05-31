package com.techshop.module.product.controller;

import com.techshop.module.product.dto.response.*;
import com.techshop.module.product.service.SanPhamService;
import com.techshop.shared.response.ApiResponse;
import com.techshop.shared.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/san-pham")
@RequiredArgsConstructor
public class SanPhamController {

    private final SanPhamService sanPhamService;

    /**
     * GET /api/san-pham
     * Query: page, size, phanLoaiId, search, minPrice, maxPrice, sortBy, thongSo
     * thongSo: chuỗi JSON tiêu chí lọc JSONB, vd {"ram":"16GB","cpu":"Intel Core i7"}
     */
    @GetMapping
    public ApiResponse<PageResponse<SanPhamCardResponse>> getSanPham(
            @RequestParam(required = false) Long phanLoaiId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(required = false) String thongSo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ApiResponse.ok(
                sanPhamService.getSanPham(phanLoaiId, search, minPrice, maxPrice, sortBy, thongSo, page, size));
    }

    /**
     * GET /api/san-pham/goi-y?q=...
     * Auto-suggest tìm kiếm, max 5 kết quả
     */
    @GetMapping("/goi-y")
    public ApiResponse<List<SuggestResponse>> getSuggest(@RequestParam String q) {
        return ApiResponse.ok(sanPhamService.getSuggest(q));
    }

    /**
     * GET /api/san-pham/so-sanh?ids=1,2,3
     * So sánh tối đa 3 sản phẩm cùng phân loại
     */
    @GetMapping("/so-sanh")
    public ApiResponse<List<SanPhamDetailResponse>> getSoSanh(
            @RequestParam List<Long> ids) {
        return ApiResponse.ok(sanPhamService.getSoSanh(ids));
    }

    /**
     * GET /api/san-pham/ung-cu-so-sanh?phanLoaiId=1&loaiTruIds=2,3
     * Danh sách ứng cử viên để chọn so sánh
     */
    @GetMapping("/ung-cu-so-sanh")
    public ApiResponse<List<SanPhamCardResponse>> getUngCuSoSanh(
            @RequestParam Long phanLoaiId,
            @RequestParam(required = false) List<Long> loaiTruIds) {
        return ApiResponse.ok(sanPhamService.getUngCuSoSanh(phanLoaiId, loaiTruIds));
    }

    /**
     * GET /api/san-pham/{slug}
     * Chi tiết sản phẩm: variants, ảnh, nhãn, sản phẩm tương tự
     */
    @GetMapping("/{slug}")
    public ApiResponse<SanPhamDetailResponse> getChiTiet(@PathVariable String slug) {
        return ApiResponse.ok(sanPhamService.getChiTiet(slug));
    }
}
