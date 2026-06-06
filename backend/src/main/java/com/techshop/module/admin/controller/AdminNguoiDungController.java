package com.techshop.module.admin.controller;

import com.techshop.module.admin.dto.request.NguoiDungCreateRequest;
import com.techshop.module.admin.dto.request.NguoiDungUpdateRequest;
import com.techshop.module.admin.dto.request.ResetMatKhauRequest;
import com.techshop.module.admin.dto.response.AdminNguoiDungResponse;
import com.techshop.module.admin.service.AdminNguoiDungService;
import com.techshop.module.order.dto.response.DonHangSummaryResponse;
import com.techshop.shared.response.ApiResponse;
import com.techshop.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/nguoi-dung")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminNguoiDungController {

    private final AdminNguoiDungService service;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminNguoiDungResponse>>> getDanhSach(
            @RequestParam(required = false) String vaiTro,
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                service.getDanhSach(vaiTro, trangThai, search, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminNguoiDungResponse>> getChiTiet(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(service.getChiTiet(id)));
    }

    @GetMapping("/{id}/don-hang")
    public ResponseEntity<ApiResponse<PageResponse<DonHangSummaryResponse>>> getDonHang(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(service.getDonHang(id, page, size)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminNguoiDungResponse>> taoMoi(
            @Valid @RequestBody NguoiDungCreateRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.taoMoi(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminNguoiDungResponse>> capNhat(
            @AuthenticationPrincipal Long adminId,
            @PathVariable Long id,
            @Valid @RequestBody NguoiDungUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(service.capNhat(adminId, id, req)));
    }

    @PatchMapping("/{id}/trang-thai")
    public ResponseEntity<ApiResponse<Void>> doiTrangThai(
            @AuthenticationPrincipal Long adminId,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        service.doiTrangThai(adminId, id, body.get("trangThai"));
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/{id}/reset-mat-khau")
    public ResponseEntity<ApiResponse<Void>> resetMatKhau(
            @AuthenticationPrincipal Long adminId,
            @PathVariable Long id,
            @Valid @RequestBody ResetMatKhauRequest req) {
        service.resetMatKhau(adminId, id, req.getMatKhauMoi());
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
