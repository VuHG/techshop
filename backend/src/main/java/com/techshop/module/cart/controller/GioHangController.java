package com.techshop.module.cart.controller;

import com.techshop.module.cart.dto.request.CapNhatSoLuongRequest;
import com.techshop.module.cart.dto.request.ThemGioHangRequest;
import com.techshop.module.cart.dto.response.GioHangResponse;
import com.techshop.module.cart.service.GioHangService;
import com.techshop.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gio-hang")
@RequiredArgsConstructor
public class GioHangController {

    private final GioHangService gioHangService;

    @GetMapping
    public ResponseEntity<ApiResponse<GioHangResponse>> getGioHang(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(gioHangService.getGioHang(userId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GioHangResponse>> themVaoGio(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody ThemGioHangRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(gioHangService.themVaoGio(userId, req)));
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<ApiResponse<GioHangResponse>> capNhatSoLuong(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long itemId,
            @Valid @RequestBody CapNhatSoLuongRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(gioHangService.capNhatSoLuong(userId, itemId, req)));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<ApiResponse<GioHangResponse>> xoaItem(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(ApiResponse.ok(gioHangService.xoaItem(userId, itemId)));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<GioHangResponse>> xoaTatCa(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(gioHangService.xoaTatCa(userId)));
    }
}
