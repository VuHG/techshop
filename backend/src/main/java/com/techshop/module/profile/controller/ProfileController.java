package com.techshop.module.profile.controller;

import com.techshop.module.profile.dto.request.CapNhatProfileRequest;
import com.techshop.module.profile.dto.request.DiaChiRequest;
import com.techshop.module.profile.dto.response.DiaChiResponse;
import com.techshop.module.profile.dto.response.ProfileResponse;
import com.techshop.module.profile.service.ProfileService;
import com.techshop.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    // ─── Hồ sơ ───────────────────────────────────────────────────────

    @GetMapping("/api/profile")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getProfile(userId)));
    }

    @PutMapping("/api/profile")
    public ResponseEntity<ApiResponse<ProfileResponse>> capNhatProfile(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody CapNhatProfileRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.capNhatProfile(userId, req)));
    }

    // ─── Sổ địa chỉ ──────────────────────────────────────────────────

    @GetMapping("/api/dia-chi")
    public ResponseEntity<ApiResponse<List<DiaChiResponse>>> getDiaChi(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getDiaChi(userId)));
    }

    @PostMapping("/api/dia-chi")
    public ResponseEntity<ApiResponse<DiaChiResponse>> themDiaChi(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody DiaChiRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(profileService.themDiaChi(userId, req)));
    }

    @PutMapping("/api/dia-chi/{id}")
    public ResponseEntity<ApiResponse<DiaChiResponse>> capNhatDiaChi(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @Valid @RequestBody DiaChiRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.capNhatDiaChi(userId, id, req)));
    }

    @DeleteMapping("/api/dia-chi/{id}")
    public ResponseEntity<ApiResponse<Void>> xoaDiaChi(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        profileService.xoaDiaChi(userId, id);
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PatchMapping("/api/dia-chi/{id}/mac-dinh")
    public ResponseEntity<ApiResponse<DiaChiResponse>> datMacDinh(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.datMacDinh(userId, id)));
    }
}
