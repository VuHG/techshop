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
import java.util.List;

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

        List<AnhSanPham> anhs = anhRepo.findAnhDaiDien(bt.getId(), sp.getId(), PageRequest.of(0, 1));
        String anhChinh = anhs.isEmpty() ? null : anhs.get(0).getUrlAnh();

        boolean conHang = "CON_HANG".equals(bt.getTrangThai()) && bt.getSoLuongTon() > 0;

        return BienTheInfo.builder()
                .bienTheId(bt.getId())
                .sanPhamId(sp.getId())
                .tenSanPham(sp.getTenSanPham())
                .slug(sp.getSlug())
                .thongSoBienThe(bt.getThongSoBienThe())
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
    public void capNhatDiemDanhGia(Long sanPhamId, int diem) {
        sanPhamRepo.capNhatDiemDanhGia(sanPhamId, diem);
    }
}
