package com.techshop.module.flashsale.controller;

import com.techshop.module.flashsale.dto.response.FlashSaleItemResponse;
import com.techshop.module.flashsale.service.FlashSaleService;
import com.techshop.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/flash-sale")
@RequiredArgsConstructor
public class FlashSaleController {

    private final FlashSaleService flashSaleService;

    /** GET /api/flash-sale — danh sách flash sale đang diễn ra (cho trang chủ). */
    @GetMapping
    public ApiResponse<List<FlashSaleItemResponse>> getDangDienRa() {
        return ApiResponse.ok(flashSaleService.getDangDienRa());
    }
}
