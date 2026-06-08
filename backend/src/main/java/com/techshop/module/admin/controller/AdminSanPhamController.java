package com.techshop.module.admin.controller;

import com.techshop.module.admin.dto.request.SanPhamRequest;
import com.techshop.module.admin.dto.response.AdminSanPhamDetailResponse;
import com.techshop.module.admin.dto.response.AdminSanPhamSummaryResponse;
import com.techshop.module.admin.dto.response.FormOptionsResponse;
import com.techshop.module.admin.service.AdminSanPhamService;
import com.techshop.shared.response.ApiResponse;
import com.techshop.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/san-pham")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSanPhamController {

    private final AdminSanPhamService service;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminSanPhamSummaryResponse>>> getDanhSach(
            @RequestParam(required = false) String trangThai,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(service.getDanhSach(trangThai, search, page, size)));
    }

    @GetMapping("/dem-trang-thai")
    public ResponseEntity<ApiResponse<Map<String, Long>>> demTrangThai() {
        return ResponseEntity.ok(ApiResponse.ok(service.demTheoTrangThai()));
    }

    /** Dữ liệu phụ trợ cho form (phân loại + nhãn). */
    @GetMapping("/tuy-chon")
    public ResponseEntity<ApiResponse<FormOptionsResponse>> getFormOptions() {
        return ResponseEntity.ok(ApiResponse.ok(service.getFormOptions()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminSanPhamDetailResponse>> getChiTiet(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(service.getChiTiet(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminSanPhamDetailResponse>> taoMoi(
            @Valid @RequestBody SanPhamRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.taoMoi(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminSanPhamDetailResponse>> capNhat(
            @PathVariable Long id, @Valid @RequestBody SanPhamRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(service.capNhat(id, req)));
    }

    /** Đổi trạng thái (ẩn/hiện/bản nháp). Body: {"trangThai":"NGUNG_BAN"}. */
    @PatchMapping("/{id}/trang-thai")
    public ResponseEntity<ApiResponse<Void>> doiTrangThai(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        service.doiTrangThai(id, body.get("trangThai"));
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> xoa(@PathVariable Long id) {
        service.xoa(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    // ─── Thao tác từng biến thể ───────────────────────────────────────────

    /** Thêm biến thể cho 1 sản phẩm. */
    @PostMapping("/{sanPhamId}/bien-the")
    public ResponseEntity<ApiResponse<Void>> themBienThe(
            @PathVariable Long sanPhamId,
            @Valid @RequestBody com.techshop.module.admin.dto.request.BienTheUpsertRequest req) {
        service.themBienThe(sanPhamId, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok());
    }

    /** Sửa 1 biến thể. */
    @PutMapping("/bien-the/{bienTheId}")
    public ResponseEntity<ApiResponse<Void>> suaBienThe(
            @PathVariable Long bienTheId,
            @Valid @RequestBody com.techshop.module.admin.dto.request.BienTheUpsertRequest req) {
        service.suaBienThe(bienTheId, req);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    /** Ẩn/hiện biến thể. Body: {"trangThai":"NGUNG_BAN"|"CON_HANG"}. */
    @PatchMapping("/bien-the/{bienTheId}/trang-thai")
    public ResponseEntity<ApiResponse<Void>> doiTrangThaiBienThe(
            @PathVariable Long bienTheId, @RequestBody Map<String, String> body) {
        service.doiTrangThaiBienThe(bienTheId, body.get("trangThai"));
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @DeleteMapping("/bien-the/{bienTheId}")
    public ResponseEntity<ApiResponse<Void>> xoaBienThe(@PathVariable Long bienTheId) {
        service.xoaBienThe(bienTheId);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
