package com.techshop.module.order.controller;

import com.techshop.module.order.dto.request.DatHangRequest;
import com.techshop.module.order.dto.request.HuyDonRequest;
import com.techshop.module.order.dto.response.DonHangResponse;
import com.techshop.module.order.dto.response.DonHangSummaryResponse;
import com.techshop.module.order.service.DonHangService;
import com.techshop.shared.response.ApiResponse;
import com.techshop.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/don-hang")
@RequiredArgsConstructor
public class DonHangController {

    private final DonHangService donHangService;

    /** Đặt hàng (checkout). */
    @PostMapping
    public ResponseEntity<ApiResponse<DonHangResponse>> datHang(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody DatHangRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(donHangService.datHang(userId, req)));
    }

    /** Danh sách đơn theo tab trạng thái (null = tất cả). */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<DonHangSummaryResponse>>> getDanhSach(
            @AuthenticationPrincipal Long userId,
            @RequestParam(required = false) String trangThai,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                donHangService.getDanhSach(userId, trangThai, page, size)));
    }

    /** Chi tiết đơn theo mã đơn. */
    @GetMapping("/{maDonHang}")
    public ResponseEntity<ApiResponse<DonHangResponse>> getChiTiet(
            @AuthenticationPrincipal Long userId,
            @PathVariable String maDonHang) {
        return ResponseEntity.ok(ApiResponse.ok(donHangService.getChiTiet(userId, maDonHang)));
    }

    /** Hủy đơn (chỉ khi đang CHO_XU_LY), kèm lý do hủy (tùy chọn). */
    @PatchMapping("/{id}/huy")
    public ResponseEntity<ApiResponse<DonHangResponse>> huyDon(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @RequestBody(required = false) HuyDonRequest req) {
        String lyDo = req == null ? null : req.getLyDo();
        return ResponseEntity.ok(ApiResponse.ok(donHangService.huyDon(userId, id, lyDo)));
    }

    /** Xác nhận đã nhận hàng (GIAO_THANH_CONG → HOAN_THANH). */
    @PatchMapping("/{id}/xac-nhan")
    public ResponseEntity<ApiResponse<DonHangResponse>> xacNhan(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(donHangService.xacNhanNhanHang(userId, id)));
    }
}
