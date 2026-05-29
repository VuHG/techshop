package com.techshop.module.discount.controller;

import com.techshop.module.discount.dto.KetQuaApDungMa;
import com.techshop.module.discount.dto.request.ApDungMaRequest;
import com.techshop.module.discount.service.MaGiamGiaService;
import com.techshop.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ma-giam-gia")
@RequiredArgsConstructor
public class MaGiamGiaController {

    private final MaGiamGiaService maGiamGiaService;

    /** Xem trước số tiền được giảm trước khi checkout. */
    @PostMapping("/ap-dung")
    public ResponseEntity<ApiResponse<KetQuaApDungMa>> apDung(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody ApDungMaRequest req) {
        KetQuaApDungMa kq = maGiamGiaService.kiemTraVaTinhGiam(
                req.getMaCode(), userId, req.getTongTienHang(), req.getSanPhamIds());
        return ResponseEntity.ok(ApiResponse.ok(kq));
    }
}
