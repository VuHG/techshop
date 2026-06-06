package com.techshop.module.admin.controller;

import com.techshop.module.admin.dto.response.DashboardResponse;
import com.techshop.module.admin.service.AdminDashboardService;
import com.techshop.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService service;

    /** range = 7d | 30d | 90d (mặc định 30d). */
    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
            @RequestParam(required = false, defaultValue = "30d") String range) {
        return ResponseEntity.ok(ApiResponse.ok(service.getDashboard(range)));
    }
}
