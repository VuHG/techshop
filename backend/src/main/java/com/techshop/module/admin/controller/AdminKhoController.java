package com.techshop.module.admin.controller;

import com.techshop.module.admin.service.AdminSanPhamService;
import com.techshop.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Kho hàng. Danh sách sản phẩm/biến thể tái dùng /api/admin/san-pham (cùng dữ liệu),
 * ở đây chỉ bổ sung thao tác CẬP NHẬT TỒN cho từng biến thể.
 */
@RestController
@RequestMapping("/api/admin/kho")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminKhoController {

    private final AdminSanPhamService sanPhamService;

    /** Cập nhật tồn kho 1 biến thể. Body: {"soLuongTon": 25}. */
    @PatchMapping("/bien-the/{bienTheId}/ton")
    public ResponseEntity<ApiResponse<Void>> capNhatTon(
            @PathVariable Long bienTheId, @RequestBody Map<String, Integer> body) {
        Integer ton = body.get("soLuongTon");
        sanPhamService.capNhatTonKho(bienTheId, ton == null ? 0 : ton);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
