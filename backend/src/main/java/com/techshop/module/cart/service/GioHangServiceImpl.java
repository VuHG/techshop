package com.techshop.module.cart.service;

import com.techshop.module.cart.dto.request.CapNhatSoLuongRequest;
import com.techshop.module.cart.dto.request.ThemGioHangRequest;
import com.techshop.module.cart.dto.response.GioHangItemResponse;
import com.techshop.module.cart.dto.response.GioHangResponse;
import com.techshop.module.cart.entity.GioHang;
import com.techshop.module.cart.repository.GioHangRepository;
import com.techshop.module.flashsale.service.FlashSaleQueryService;
import com.techshop.module.product.dto.BienTheInfo;
import com.techshop.module.product.service.ProductQueryService;
import com.techshop.shared.exception.AppException;
import com.techshop.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GioHangServiceImpl implements GioHangService {

    private final GioHangRepository gioHangRepo;
    private final ProductQueryService productQueryService;
    private final FlashSaleQueryService flashSaleQueryService;

    @Override
    @Transactional(readOnly = true)
    public GioHangResponse getGioHang(Long nguoiDungId) {
        return buildResponse(nguoiDungId);
    }

    @Override
    @Transactional
    public GioHangResponse themVaoGio(Long nguoiDungId, ThemGioHangRequest req) {
        BienTheInfo info = productQueryService.layThongTinBienThe(req.getBienTheId());
        if (!info.isConHang()) {
            throw new AppException(ErrorCode.PROD_004);
        }

        GioHang line = gioHangRepo
                .findByNguoiDungIdAndBienTheId(nguoiDungId, req.getBienTheId())
                .orElse(null);

        int soLuongMoi = (line == null ? 0 : line.getSoLuong()) + req.getSoLuong();
        if (soLuongMoi > info.getSoLuongTon()) {
            throw new AppException(ErrorCode.CART_001);
        }

        if (line == null) {
            line = GioHang.builder()
                    .nguoiDungId(nguoiDungId)
                    .bienTheId(req.getBienTheId())
                    .soLuong(req.getSoLuong())
                    .build();
        } else {
            line.setSoLuong(soLuongMoi);
        }
        gioHangRepo.save(line);

        return buildResponse(nguoiDungId);
    }

    @Override
    @Transactional
    public GioHangResponse capNhatSoLuong(Long nguoiDungId, Long itemId, CapNhatSoLuongRequest req) {
        GioHang line = gioHangRepo.findByIdAndNguoiDungId(itemId, nguoiDungId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_003));

        BienTheInfo info = productQueryService.layThongTinBienThe(line.getBienTheId());
        if (req.getSoLuong() > info.getSoLuongTon()) {
            throw new AppException(ErrorCode.CART_001);
        }

        line.setSoLuong(req.getSoLuong());
        gioHangRepo.save(line);

        return buildResponse(nguoiDungId);
    }

    @Override
    @Transactional
    public GioHangResponse xoaItem(Long nguoiDungId, Long itemId) {
        GioHang line = gioHangRepo.findByIdAndNguoiDungId(itemId, nguoiDungId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_003));
        gioHangRepo.delete(line);
        return buildResponse(nguoiDungId);
    }

    @Override
    @Transactional
    public GioHangResponse xoaTatCa(Long nguoiDungId) {
        gioHangRepo.deleteByNguoiDungId(nguoiDungId);
        return GioHangResponse.builder()
                .items(new ArrayList<>())
                .tongSoLuong(0)
                .tongTien(BigDecimal.ZERO)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<GioHangItemResponse> layItemDaChon(Long nguoiDungId, List<Long> itemIds) {
        return gioHangRepo.findByNguoiDungIdAndIdIn(nguoiDungId, itemIds).stream()
                .map(this::toItemResponse)
                .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
    }

    @Override
    @Transactional
    public void xoaItems(Long nguoiDungId, List<Long> itemIds) {
        gioHangRepo.deleteByNguoiDungIdAndIdIn(nguoiDungId, itemIds);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private GioHangResponse buildResponse(Long nguoiDungId) {
        List<GioHangItemResponse> items = gioHangRepo
                .findByNguoiDungIdOrderByNgayTaoDesc(nguoiDungId).stream()
                .map(this::toItemResponse)
                .collect(java.util.stream.Collectors.toCollection(ArrayList::new));

        int tongSoLuong = items.stream().mapToInt(GioHangItemResponse::getSoLuong).sum();
        BigDecimal tongTien = items.stream()
                .filter(GioHangItemResponse::isConHang)
                .map(GioHangItemResponse::getThanhTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return GioHangResponse.builder()
                .items(items)
                .tongSoLuong(tongSoLuong)
                .tongTien(tongTien)
                .build();
    }

    private GioHangItemResponse toItemResponse(GioHang line) {
        BienTheInfo info = productQueryService.layThongTinBienThe(line.getBienTheId());
        // Giá hiệu lực = giá flash sale nếu biến thể đang trong flash sale còn hiệu lực,
        // ngược lại là giá hiển thị thường (giaKhuyenMai ?? gia). Giỏ + đơn dùng chung giá này.
        BigDecimal gia = flashSaleQueryService.giaFlashSaleConHieuLuc(line.getBienTheId())
                .orElse(info.getGiaHienThi());
        BigDecimal thanhTien = gia.multiply(BigDecimal.valueOf(line.getSoLuong()));
        boolean conHang = info.isConHang() && info.getSoLuongTon() >= line.getSoLuong();

        return GioHangItemResponse.builder()
                .id(line.getId())
                .bienTheId(info.getBienTheId())
                .sanPhamId(info.getSanPhamId())
                .slug(info.getSlug())
                .tenSanPham(info.getTenSanPham())
                .thuongHieu(info.getThuongHieu())
                .thongSoBienThe(info.getThongSoBienThe())
                .anhChinh(info.getAnhChinh())
                .gia(gia)
                .soLuong(line.getSoLuong())
                .soLuongTon(info.getSoLuongTon())
                .thanhTien(thanhTien)
                .conHang(conHang)
                .build();
    }
}
