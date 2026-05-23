package com.techshop.module.auth.controller;

import com.techshop.module.auth.dto.request.*;
import com.techshop.module.auth.dto.response.AuthResponse;
import com.techshop.module.auth.service.AuthService;
import com.techshop.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/dang-ky")
    public ResponseEntity<ApiResponse<String>> dangKy(@Valid @RequestBody DangKyRequest req) {
        String message = authService.dangKy(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(message));
    }

    @PostMapping("/xac-thuc-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> xacThucOtp(@Valid @RequestBody XacThucOtpRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(authService.xacThucOtp(req)));
    }

    @PostMapping("/gui-lai-otp")
    public ResponseEntity<ApiResponse<String>> guiLaiOtp(@Valid @RequestBody GuiLaiOtpRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(authService.guiLaiOtp(req)));
    }

    @PostMapping("/dang-nhap")
    public ResponseEntity<ApiResponse<AuthResponse>> dangNhap(@Valid @RequestBody DangNhapRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(authService.dangNhap(req)));
    }

    @PostMapping("/quen-mat-khau")
    public ResponseEntity<ApiResponse<String>> quenMatKhau(@Valid @RequestBody QuenMatKhauRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(authService.quenMatKhau(req)));
    }

    @PostMapping("/dat-lai-mat-khau")
    public ResponseEntity<ApiResponse<String>> datLaiMatKhau(@Valid @RequestBody DatLaiMatKhauRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(authService.datLaiMatKhau(req)));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(authService.refreshToken(req)));
    }

    @PostMapping("/dang-xuat")
    public ResponseEntity<ApiResponse<Void>> dangXuat(@AuthenticationPrincipal Long userId) {
        authService.dangXuat(userId);
        return ResponseEntity.ok(ApiResponse.ok());
    }
}
