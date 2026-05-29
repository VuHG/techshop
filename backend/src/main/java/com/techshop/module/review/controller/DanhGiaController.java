package com.techshop.module.review.controller;

import com.techshop.module.review.dto.request.TaoDanhGiaRequest;
import com.techshop.module.review.dto.response.DanhGiaResponse;
import com.techshop.module.review.service.DanhGiaService;
import com.techshop.shared.response.ApiResponse;
import com.techshop.shared.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class DanhGiaController {

    private final DanhGiaService danhGiaService;

    /** Tạo đánh giá (chỉ sau khi đơn HOAN_THANH). */
    @PostMapping("/api/danh-gia")
    public ResponseEntity<ApiResponse<DanhGiaResponse>> taoDanhGia(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody TaoDanhGiaRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(danhGiaService.taoDanhGia(userId, req)));
    }

    /** Lịch sử đánh giá của tôi (UC16). */
    @GetMapping("/api/danh-gia/cua-toi")
    public ResponseEntity<ApiResponse<PageResponse<DanhGiaResponse>>> getCuaToi(
            @AuthenticationPrincipal Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(danhGiaService.getCuaToi(userId, page, size)));
    }

    /** Đánh giá của 1 sản phẩm (public — hiển thị ở trang sản phẩm). */
    @GetMapping("/api/san-pham/{sanPhamId}/danh-gia")
    public ResponseEntity<ApiResponse<PageResponse<DanhGiaResponse>>> getTheoSanPham(
            @PathVariable Long sanPhamId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(danhGiaService.getTheoSanPham(sanPhamId, page, size)));
    }
}
