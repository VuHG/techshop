package com.techshop.module.admin.controller;

import com.techshop.module.admin.dto.request.MaGiamGiaRequest;
import com.techshop.module.admin.dto.response.MaGiamGiaResponse;
import com.techshop.module.admin.service.AdminMaGiamGiaService;
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
@RequestMapping("/api/admin/ma-giam-gia")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMaGiamGiaController {

    private final AdminMaGiamGiaService service;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MaGiamGiaResponse>>> getDanhSach(
            @RequestParam(required = false) String tinhTrang,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(service.getDanhSach(tinhTrang, search, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MaGiamGiaResponse>> getChiTiet(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(service.getChiTiet(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MaGiamGiaResponse>> taoMoi(
            @Valid @RequestBody MaGiamGiaRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.taoMoi(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MaGiamGiaResponse>> capNhat(
            @PathVariable Long id, @Valid @RequestBody MaGiamGiaRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(service.capNhat(id, req)));
    }

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
}
