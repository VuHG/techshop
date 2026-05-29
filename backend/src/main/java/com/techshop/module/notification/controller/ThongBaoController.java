package com.techshop.module.notification.controller;

import com.techshop.module.notification.dto.response.ThongBaoResponse;
import com.techshop.module.notification.service.NotificationService;
import com.techshop.shared.response.ApiResponse;
import com.techshop.shared.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/thong-bao")
@RequiredArgsConstructor
public class ThongBaoController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ThongBaoResponse>>> getDanhSach(
            @AuthenticationPrincipal Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getDanhSach(userId, page, size)));
    }

    @GetMapping("/chua-doc/dem")
    public ResponseEntity<ApiResponse<Long>> demChuaDoc(@AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.demChuaDoc(userId)));
    }

    @PatchMapping("/{id}/da-doc")
    public ResponseEntity<ApiResponse<Void>> danhDauDaDoc(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        notificationService.danhDauDaDoc(userId, id);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PatchMapping("/da-doc-tat-ca")
    public ResponseEntity<ApiResponse<Void>> danhDauTatCa(@AuthenticationPrincipal Long userId) {
        notificationService.danhDauTatCaDaDoc(userId);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
