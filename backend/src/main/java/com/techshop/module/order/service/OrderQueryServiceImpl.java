package com.techshop.module.order.service;

import com.techshop.module.order.repository.ChiTietDonHangRepository;
import com.techshop.module.order.repository.DonHangRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderQueryServiceImpl implements OrderQueryService {

    private final DonHangRepository donHangRepo;
    private final ChiTietDonHangRepository chiTietRepo;

    @Override
    @Transactional(readOnly = true)
    public boolean kiemTraDonChoDanhGia(Long donHangId, Long nguoiDungId, Long bienTheId) {
        boolean donHopLe = donHangRepo.findByIdAndNguoiDungId(donHangId, nguoiDungId)
                .map(d -> "HOAN_THANH".equals(d.getTrangThai()))
                .orElse(false);
        return donHopLe && chiTietRepo.existsByDonHang_IdAndBienTheId(donHangId, bienTheId);
    }
}
