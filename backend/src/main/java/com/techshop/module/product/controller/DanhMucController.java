package com.techshop.module.product.controller;

import com.techshop.module.product.dto.response.DanhMucResponse;
import com.techshop.module.product.dto.response.PhanLoaiResponse;
import com.techshop.module.product.service.DanhMucService;
import com.techshop.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class DanhMucController {

    private final DanhMucService danhMucService;

    /** GET /api/danh-muc — cây danh mục toàn bộ */
    @GetMapping("/api/danh-muc")
    public ApiResponse<List<DanhMucResponse>> getCayDanhMuc() {
        return ApiResponse.ok(danhMucService.getCayDanhMuc());
    }

    /** GET /api/danh-muc/{slug}/phan-loai — phân loại thuộc danh mục */
    @GetMapping("/api/danh-muc/{slug}/phan-loai")
    public ApiResponse<List<PhanLoaiResponse>> getPhanLoai(@PathVariable String slug) {
        return ApiResponse.ok(danhMucService.getPhanLoaiTheoDanhMuc(slug));
    }

    /** GET /api/phan-loai/{id}/filter-schema — JSONB filter schema của phân loại */
    @GetMapping("/api/phan-loai/{id}/filter-schema")
    public ApiResponse<Map<String, Object>> getFilterSchema(@PathVariable Long id) {
        return ApiResponse.ok(danhMucService.getFilterSchema(id));
    }
}
