package com.techshop.module.admin.controller;

import com.techshop.module.dexuat.dto.DeXuatGiaResponse;
import com.techshop.module.dexuat.dto.DeXuatVoucherResponse;
import com.techshop.module.dexuat.service.DeXuatService;
import com.techshop.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Admin duyệt đề xuất giá & voucher (do engine rule-based sinh, admin quyết định áp dụng). */
@RestController
@RequestMapping("/api/admin/de-xuat")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDeXuatController {

    private final DeXuatService service;

    @GetMapping("/gia")
    public ApiResponse<List<DeXuatGiaResponse>> danhSachGia() {
        return ApiResponse.ok(service.danhSachGia());
    }

    @GetMapping("/voucher")
    public ApiResponse<List<DeXuatVoucherResponse>> danhSachVoucher() {
        return ApiResponse.ok(service.danhSachVoucher());
    }

    @PostMapping("/gia/{id}/chap-nhan")
    public ApiResponse<Void> chapNhanGia(@PathVariable Long id) {
        service.chapNhanGia(id);
        return ApiResponse.ok();
    }

    @PostMapping("/gia/{id}/tu-choi")
    public ApiResponse<Void> tuChoiGia(@PathVariable Long id) {
        service.tuChoiGia(id);
        return ApiResponse.ok();
    }

    @PostMapping("/voucher/{id}/chap-nhan")
    public ApiResponse<Void> chapNhanVoucher(@PathVariable Long id) {
        service.chapNhanVoucher(id);
        return ApiResponse.ok();
    }

    @PostMapping("/voucher/{id}/tu-choi")
    public ApiResponse<Void> tuChoiVoucher(@PathVariable Long id) {
        service.tuChoiVoucher(id);
        return ApiResponse.ok();
    }

    /** Sinh đề xuất ngay (demo/kiểm thử — không phải chờ lịch tự động). */
    @PostMapping("/tao-ngay")
    public ApiResponse<Map<String, Integer>> taoNgay() {
        return ApiResponse.ok(service.taoDeXuatNgay());
    }
}
