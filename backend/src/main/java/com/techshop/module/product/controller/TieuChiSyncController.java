package com.techshop.module.product.controller;

import com.techshop.module.product.service.TieuChiSyncService;
import com.techshop.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Đồng bộ tiêu chí lọc (thong_so_loc) từ thuoc_tinh/gia_tri_thuoc_tinh.
 * POST (cần JWT). Dành cho Admin (chưa có role guard ở MVP) — sẽ được Admin CRUD
 * thuộc tính gọi tự động khi dữ liệu thay đổi.
 */
@RestController
@RequiredArgsConstructor
public class TieuChiSyncController {

    private final TieuChiSyncService tieuChiSyncService;

    @PostMapping("/api/phan-loai/{id}/dong-bo-tieu-chi")
    public ApiResponse<String> dongBoMot(@PathVariable Long id) {
        tieuChiSyncService.dongBoMot(id);
        return ApiResponse.ok("Đã đồng bộ tiêu chí lọc cho phân loại " + id);
    }

    @PostMapping("/api/tieu-chi/dong-bo-tat-ca")
    public ApiResponse<String> dongBoTatCa() {
        int n = tieuChiSyncService.dongBoTatCa();
        return ApiResponse.ok("Đã đồng bộ tiêu chí lọc cho " + n + " phân loại");
    }
}
