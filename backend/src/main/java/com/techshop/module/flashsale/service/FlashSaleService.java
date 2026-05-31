package com.techshop.module.flashsale.service;

import com.techshop.module.flashsale.dto.response.FlashSaleItemResponse;
import com.techshop.module.flashsale.entity.FlashSale;
import com.techshop.module.flashsale.repository.FlashSaleRepository;
import com.techshop.module.product.dto.BienTheInfo;
import com.techshop.module.product.service.ProductQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FlashSaleService implements FlashSaleQueryService {

    private final FlashSaleRepository flashSaleRepo;
    private final ProductQueryService productQueryService;

    @Override
    public Optional<BigDecimal> giaFlashSaleConHieuLuc(Long bienTheId) {
        return flashSaleRepo.findConHieuLucDau(bienTheId, OffsetDateTime.now())
                .map(FlashSale::getGiaFlashSale);
    }

    /** Danh sách flash sale đang diễn ra (cho trang chủ). Bỏ qua biến thể đã ẩn/xóa. */
    public List<FlashSaleItemResponse> getDangDienRa() {
        List<FlashSale> list = flashSaleRepo.findTatCaDangDienRa(OffsetDateTime.now());
        List<FlashSaleItemResponse> result = new ArrayList<>();
        for (FlashSale fs : list) {
            BienTheInfo info;
            try {
                info = productQueryService.layThongTinBienThe(fs.getBienTheId());
            } catch (Exception e) {
                continue; // biến thể không còn → bỏ qua
            }
            BigDecimal giaGoc = info.getGiaHienThi();
            int phanTram = 0;
            if (giaGoc != null && giaGoc.signum() > 0) {
                phanTram = giaGoc.subtract(fs.getGiaFlashSale())
                        .multiply(BigDecimal.valueOf(100))
                        .divide(giaGoc, 0, RoundingMode.HALF_UP)
                        .intValue();
            }
            result.add(FlashSaleItemResponse.builder()
                    .flashSaleId(fs.getId())
                    .bienTheId(info.getBienTheId())
                    .sanPhamId(info.getSanPhamId())
                    .slug(info.getSlug())
                    .tenSanPham(info.getTenSanPham())
                    .thongSoBienThe(info.getThongSoBienThe())
                    .anhChinh(info.getAnhChinh())
                    .giaGoc(giaGoc)
                    .giaFlashSale(fs.getGiaFlashSale())
                    .phanTramGiam(phanTram)
                    .soLuongGioiHan(fs.getSoLuongGioiHan())
                    .soLuongDaBan(fs.getSoLuongDaBan())
                    .thoiGianKetThuc(fs.getThoiGianKetThuc())
                    .build());
        }
        return result;
    }
}
