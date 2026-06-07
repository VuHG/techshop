package com.techshop.module.admin.controller;

import com.techshop.module.admin.dto.request.ThuocTinhRequest;
import com.techshop.module.admin.dto.response.ThuocTinhResponse;
import com.techshop.module.admin.service.AdminThuocTinhService;
import com.techshop.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/thuoc-tinh")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminThuocTinhController {

    private final AdminThuocTinhService service;

    /** Danh sách thuộc tính của một phân loại. */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ThuocTinhResponse>>> getDanhSach(
            @RequestParam Long phanLoaiId) {
        return ResponseEntity.ok(ApiResponse.ok(service.getDanhSach(phanLoaiId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ThuocTinhResponse>> taoMoi(
            @Valid @RequestBody ThuocTinhRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.taoMoi(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ThuocTinhResponse>> capNhat(
            @PathVariable Long id, @Valid @RequestBody ThuocTinhRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(service.capNhat(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> xoa(@PathVariable Long id) {
        service.xoa(id);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
