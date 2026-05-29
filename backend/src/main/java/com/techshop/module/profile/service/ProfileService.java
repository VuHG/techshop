package com.techshop.module.profile.service;

import com.techshop.module.auth.dto.NguoiDungInfo;
import com.techshop.module.auth.service.NguoiDungQueryService;
import com.techshop.module.profile.dto.request.CapNhatProfileRequest;
import com.techshop.module.profile.dto.request.DiaChiRequest;
import com.techshop.module.profile.dto.response.DiaChiResponse;
import com.techshop.module.profile.dto.response.ProfileResponse;
import com.techshop.module.profile.entity.DiaChi;
import com.techshop.module.profile.repository.DiaChiRepository;
import com.techshop.shared.exception.AppException;
import com.techshop.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final NguoiDungQueryService nguoiDungQueryService;
    private final DiaChiRepository diaChiRepo;

    // ─── Hồ sơ cá nhân ───────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long nguoiDungId) {
        return toProfileResponse(nguoiDungQueryService.layThongTin(nguoiDungId));
    }

    @Transactional
    public ProfileResponse capNhatProfile(Long nguoiDungId, CapNhatProfileRequest req) {
        NguoiDungInfo info = nguoiDungQueryService.capNhatThongTin(
                nguoiDungId, req.getHoTen(), req.getEmail(), req.getNgaySinh());
        return toProfileResponse(info);
    }

    // ─── Sổ địa chỉ ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<DiaChiResponse> getDiaChi(Long nguoiDungId) {
        return diaChiRepo.findByNguoiDungIdOrderByLaMacDinhDescNgayTaoDesc(nguoiDungId).stream()
                .map(this::toDiaChiResponse)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    @Transactional
    public DiaChiResponse themDiaChi(Long nguoiDungId, DiaChiRequest req) {
        boolean laDiaChiDauTien = diaChiRepo.countByNguoiDungId(nguoiDungId) == 0;
        boolean macDinh = req.isLaMacDinh() || laDiaChiDauTien;

        if (macDinh) {
            diaChiRepo.goCoMacDinh(nguoiDungId);
        }

        DiaChi dc = DiaChi.builder()
                .nguoiDungId(nguoiDungId)
                .hoTenNguoiNhan(req.getHoTenNguoiNhan())
                .soDienThoai(req.getSoDienThoai())
                .diaChiChiTiet(req.getDiaChiChiTiet())
                .phuongXa(req.getPhuongXa())
                .quanHuyen(req.getQuanHuyen())
                .tinhThanh(req.getTinhThanh())
                .laMacDinh(macDinh)
                .build();
        diaChiRepo.save(dc);
        return toDiaChiResponse(dc);
    }

    @Transactional
    public DiaChiResponse capNhatDiaChi(Long nguoiDungId, Long id, DiaChiRequest req) {
        DiaChi dc = diaChiRepo.findByIdAndNguoiDungId(id, nguoiDungId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDR_001));

        if (req.isLaMacDinh() && !dc.isLaMacDinh()) {
            diaChiRepo.goCoMacDinh(nguoiDungId);
            dc.setLaMacDinh(true);
        }

        dc.setHoTenNguoiNhan(req.getHoTenNguoiNhan());
        dc.setSoDienThoai(req.getSoDienThoai());
        dc.setDiaChiChiTiet(req.getDiaChiChiTiet());
        dc.setPhuongXa(req.getPhuongXa());
        dc.setQuanHuyen(req.getQuanHuyen());
        dc.setTinhThanh(req.getTinhThanh());
        diaChiRepo.save(dc);
        return toDiaChiResponse(dc);
    }

    @Transactional
    public void xoaDiaChi(Long nguoiDungId, Long id) {
        DiaChi dc = diaChiRepo.findByIdAndNguoiDungId(id, nguoiDungId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDR_001));
        diaChiRepo.delete(dc);
    }

    @Transactional
    public DiaChiResponse datMacDinh(Long nguoiDungId, Long id) {
        DiaChi dc = diaChiRepo.findByIdAndNguoiDungId(id, nguoiDungId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDR_001));
        diaChiRepo.goCoMacDinh(nguoiDungId);
        dc.setLaMacDinh(true);
        diaChiRepo.save(dc);
        return toDiaChiResponse(dc);
    }

    // ─── Mapping helpers ─────────────────────────────────────────────

    private ProfileResponse toProfileResponse(NguoiDungInfo info) {
        return ProfileResponse.builder()
                .id(info.getId())
                .hoTen(info.getHoTen())
                .soDienThoai(info.getSoDienThoai())
                .email(info.getEmail())
                .ngaySinh(info.getNgaySinh())
                .vaiTro(info.getVaiTro())
                .build();
    }

    private DiaChiResponse toDiaChiResponse(DiaChi dc) {
        String dayDu = String.join(", ",
                dc.getDiaChiChiTiet(), dc.getPhuongXa(), dc.getQuanHuyen(), dc.getTinhThanh());
        return DiaChiResponse.builder()
                .id(dc.getId())
                .hoTenNguoiNhan(dc.getHoTenNguoiNhan())
                .soDienThoai(dc.getSoDienThoai())
                .diaChiChiTiet(dc.getDiaChiChiTiet())
                .phuongXa(dc.getPhuongXa())
                .quanHuyen(dc.getQuanHuyen())
                .tinhThanh(dc.getTinhThanh())
                .laMacDinh(dc.isLaMacDinh())
                .diaChiDayDu(dayDu)
                .build();
    }
}
