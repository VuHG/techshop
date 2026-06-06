package com.techshop.module.admin.controller;

import com.techshop.module.admin.dto.request.DanhMucRequest;
import com.techshop.module.admin.dto.request.PhanLoaiRequest;
import com.techshop.module.admin.dto.response.DanhMucTreeResponse;
import com.techshop.module.admin.service.AdminDanhMucService;
import com.techshop.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/danh-muc")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDanhMucController {

    private final AdminDanhMucService service;

    @GetMapping("/cay")
    public ResponseEntity<ApiResponse<List<DanhMucTreeResponse>>> getCay() {
        return ResponseEntity.ok(ApiResponse.ok(service.getCay()));
    }

    // ─── Danh mục gốc ─────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> taoDanhMuc(@Valid @RequestBody DanhMucRequest req) {
        service.taoDanhMuc(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> capNhatDanhMuc(
            @PathVariable Long id, @Valid @RequestBody DanhMucRequest req) {
        service.capNhatDanhMuc(id, req);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PatchMapping("/{id}/trang-thai")
    public ResponseEntity<ApiResponse<Void>> doiTrangThai(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        service.doiTrangThai(id, body.get("trangThai"));
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> xoaDanhMuc(@PathVariable Long id) {
        service.xoaDanhMuc(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    // ─── Phân loại ────────────────────────────────────────────────────────

    @PostMapping("/phan-loai")
    public ResponseEntity<ApiResponse<Void>> taoPhanLoai(@Valid @RequestBody PhanLoaiRequest req) {
        service.taoPhanLoai(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok());
    }

    @PutMapping("/phan-loai/{id}")
    public ResponseEntity<ApiResponse<Void>> capNhatPhanLoai(
            @PathVariable Long id, @Valid @RequestBody PhanLoaiRequest req) {
        service.capNhatPhanLoai(id, req);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @DeleteMapping("/phan-loai/{id}")
    public ResponseEntity<ApiResponse<Void>> xoaPhanLoai(@PathVariable Long id) {
        service.xoaPhanLoai(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
