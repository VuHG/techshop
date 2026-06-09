package com.techshop.module.product.service;

import com.techshop.module.product.dto.BienTheInfo;
import com.techshop.module.product.entity.AnhSanPham;
import com.techshop.module.product.entity.BienTheSanPham;
import com.techshop.module.product.entity.SanPham;
import com.techshop.module.product.repository.AnhSanPhamRepository;
import com.techshop.module.product.repository.BienTheSanPhamRepository;
import com.techshop.module.product.repository.SanPhamRepository;
import com.techshop.shared.exception.AppException;
import com.techshop.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductQueryServiceImpl implements ProductQueryService {

    private final BienTheSanPhamRepository bienTheRepo;
    private final SanPhamRepository sanPhamRepo;
    private final AnhSanPhamRepository anhRepo;

    @Override
    @Transactional(readOnly = true)
    public BienTheInfo layThongTinBienThe(Long bienTheId) {
        BienTheSanPham bt = bienTheRepo.findByIdWithSanPham(bienTheId)
                .orElseThrow(() -> new AppException(ErrorCode.PROD_002));

        SanPham sp = bt.getSanPham();
        BigDecimal giaHienThi = bt.getGiaKhuyenMai() != null ? bt.getGiaKhuyenMai() : bt.getGia();

        List<AnhSanPham> anhs = anhRepo.findAnhDaiDien(bt.getId(), PageRequest.of(0, 1));
        String anhChinh = anhs.isEmpty() ? sp.getAnhDaiDien() : anhs.get(0).getUrlAnh();

        boolean conHang = "CON_HANG".equals(bt.getTrangThai()) && bt.getSoLuongTon() > 0;

        // Gộp màu vào thông số để giỏ hàng / snapshot đơn vẫn hiển thị đầy đủ
        // (màu đã tách sang cột mau_sac từ V14, nhưng các nơi hiển thị/snapshot cần map đầy đủ).
        Map<String, Object> thongSo = new LinkedHashMap<>();
        if (bt.getThongSoBienThe() != null) thongSo.putAll(bt.getThongSoBienThe());
        if (bt.getMauSac() != null && !bt.getMauSac().isBlank()) {
            thongSo.put("Màu sắc", bt.getMauSac());
        }

        return BienTheInfo.builder()
                .bienTheId(bt.getId())
                .sanPhamId(sp.getId())
                .tenSanPham(sp.getTenSanPham())
                .slug(sp.getSlug())
                .thongSoBienThe(thongSo)
                .anhChinh(anhChinh)
                .gia(bt.getGia())
                .giaKhuyenMai(bt.getGiaKhuyenMai())
                .giaHienThi(giaHienThi)
                .soLuongTon(bt.getSoLuongTon())
                .trangThai(bt.getTrangThai())
                .conHang(conHang)
                .build();
    }

    @Override
    @Transactional
    public boolean truTonKho(Long bienTheId, int soLuong) {
        return bienTheRepo.truTonKho(bienTheId, soLuong) > 0;
    }

    @Override
    @Transactional
    public void hoanTonKho(Long bienTheId, int soLuong) {
        bienTheRepo.hoanTonKho(bienTheId, soLuong);
    }

    @Override
    @Transactional
    public void tangSoLuotBan(Long sanPhamId, int soLuong) {
        sanPhamRepo.tangSoLuotBan(sanPhamId, soLuong);
    }

    @Override
    @Transactional
    public void tangSoLuotBanBienThe(Long bienTheId, int soLuong) {
        bienTheRepo.tangSoLuotBan(bienTheId, soLuong);
    }

    @Override
    @Transactional
    public void capNhatDiemDanhGia(Long sanPhamId, int diem) {
        sanPhamRepo.capNhatDiemDanhGia(sanPhamId, diem);
    }

    @Override
    @Transactional
    public void tangSoLuotDanhGiaBienThe(Long bienTheId) {
        if (bienTheId != null) bienTheRepo.tangSoLuotDanhGia(bienTheId);
    }

    @Override
    @Transactional
    public void giamDanhGia(Long sanPhamId, Long bienTheId, int diem) {
        sanPhamRepo.xoaDanhGia(sanPhamId, diem);
        if (bienTheId != null) bienTheRepo.giamSoLuotDanhGia(bienTheId);
    }
}
