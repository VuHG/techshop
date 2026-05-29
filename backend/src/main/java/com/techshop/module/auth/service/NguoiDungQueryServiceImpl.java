package com.techshop.module.auth.service;

import com.techshop.module.auth.dto.NguoiDungInfo;
import com.techshop.module.auth.entity.NguoiDung;
import com.techshop.module.auth.repository.NguoiDungRepository;
import com.techshop.shared.exception.AppException;
import com.techshop.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class NguoiDungQueryServiceImpl implements NguoiDungQueryService {

    private final NguoiDungRepository nguoiDungRepository;

    @Override
    @Transactional(readOnly = true)
    public NguoiDungInfo layThongTin(Long nguoiDungId) {
        NguoiDung nd = nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new AppException(ErrorCode.AUTH_008));
        return toInfo(nd);
    }

    @Override
    @Transactional
    public NguoiDungInfo capNhatThongTin(Long nguoiDungId, String hoTen, String email, LocalDate ngaySinh) {
        NguoiDung nd = nguoiDungRepository.findById(nguoiDungId)
                .orElseThrow(() -> new AppException(ErrorCode.AUTH_008));

        if (email != null && !email.isBlank()
                && nguoiDungRepository.existsByEmailAndIdNot(email, nguoiDungId)) {
            throw new AppException(ErrorCode.PROFILE_001);
        }

        nd.setHoTen(hoTen);
        nd.setEmail(email == null || email.isBlank() ? null : email);
        nd.setNgaySinh(ngaySinh);
        nguoiDungRepository.save(nd);

        return toInfo(nd);
    }

    private NguoiDungInfo toInfo(NguoiDung nd) {
        return NguoiDungInfo.builder()
                .id(nd.getId())
                .hoTen(nd.getHoTen())
                .soDienThoai(nd.getSoDienThoai())
                .email(nd.getEmail())
                .ngaySinh(nd.getNgaySinh())
                .vaiTro(nd.getVaiTro().getTenVaiTro())
                .build();
    }
}
