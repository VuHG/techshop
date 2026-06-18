package com.techshop.module.admin.controller;

import com.techshop.module.admin.dto.request.HuyDonAdminRequest;
import com.techshop.module.order.dto.response.DonHangResponse;
import com.techshop.module.order.dto.response.DonHangSummaryResponse;
import com.techshop.module.order.service.DonHangService;
import com.techshop.shared.response.ApiResponse;
import com.techshop.shared.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

/**
 * Quản trị đơn hàng. Tái dùng DonHangService (state machine + hoàn kho/mã sống ở module order).
 * Bảo vệ 2 lớp: rule /api/admin/** ở SecurityConfig + @PreAuthorize tại đây.
 */
@RestController
@RequestMapping("/api/admin/don-hang")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDonHangController {

    private final DonHangService donHangService;

    /** Danh sách đơn toàn hệ thống: lọc trạng thái + tìm theo mã/tên/SĐT + lọc theo ngày đặt. */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<DonHangSummaryResponse>>> getDanhSach(
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate denNgay,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                donHangService.getDanhSachAdmin(trangThai, search, tuNgay, denNgay, page, size)));
    }

    /** Đếm số đơn theo từng trạng thái (badge các tab). */
    @GetMapping("/dem-trang-thai")
    public ResponseEntity<ApiResponse<Map<String, Long>>> demTrangThai() {
        return ResponseEntity.ok(ApiResponse.ok(donHangService.demTheoTrangThai()));
    }

    /** Chi tiết đơn theo id (admin xem mọi đơn). */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DonHangResponse>> getChiTiet(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(donHangService.getChiTietAdmin(id)));
    }

    /** Duyệt đơn: CHO_XU_LY → DA_DUYET. */
    @PatchMapping("/{id}/duyet")
    public ResponseEntity<ApiResponse<DonHangResponse>> duyet(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(donHangService.duyetDon(id)));
    }

    /** Bàn giao vận chuyển: DA_DUYET → DANG_GIAO. */
    @PatchMapping("/{id}/giao")
    public ResponseEntity<ApiResponse<DonHangResponse>> giao(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(donHangService.xacNhanGiao(id)));
    }

    /** Giao thành công: DANG_GIAO → GIAO_THANH_CONG. */
    @PatchMapping("/{id}/hoan-tat")
    public ResponseEntity<ApiResponse<DonHangResponse>> hoanTat(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(donHangService.hoanTatGiao(id)));
    }

    /** Hủy đơn (admin) + hoàn lượt mã. Tồn kho chờ xác nhận "hàng đã trở lại kho" riêng. */
    @PatchMapping("/{id}/huy")
    public ResponseEntity<ApiResponse<DonHangResponse>> huy(
            @PathVariable Long id,
            @RequestBody(required = false) HuyDonAdminRequest req) {
        String lyDo = req == null ? null : req.getLyDo();
        return ResponseEntity.ok(ApiResponse.ok(donHangService.huyDonAdmin(id, lyDo)));
    }

    /** Xác nhận hàng của đơn đã hủy đã trở lại kho → hoàn tồn (1 lần). */
    @PatchMapping("/{id}/hoan-kho")
    public ResponseEntity<ApiResponse<DonHangResponse>> hoanKho(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(donHangService.xacNhanHoanKho(id)));
    }
}
