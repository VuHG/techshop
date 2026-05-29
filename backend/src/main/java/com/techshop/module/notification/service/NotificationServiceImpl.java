package com.techshop.module.notification.service;

import com.techshop.module.notification.dto.response.ThongBaoResponse;
import com.techshop.module.notification.entity.ThongBao;
import com.techshop.module.notification.repository.ThongBaoRepository;
import com.techshop.shared.exception.AppException;
import com.techshop.shared.exception.ErrorCode;
import com.techshop.shared.response.PageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final ThongBaoRepository thongBaoRepo;

    @Override
    @Async("emailExecutor")
    public void taoThongBao(Long nguoiDungId, String loai, String tieuDe, String noiDung, Long thamChieuId) {
        try {
            thongBaoRepo.save(ThongBao.builder()
                    .nguoiDungId(nguoiDungId)
                    .loaiThongBao(loai)
                    .tieuDe(tieuDe)
                    .noiDung(noiDung)
                    .thamChieuId(thamChieuId)
                    .daDoc(false)
                    .build());
        } catch (Exception e) {
            log.error("Không tạo được thông báo cho user {}: {}", nguoiDungId, e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ThongBaoResponse> getDanhSach(Long nguoiDungId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ThongBao> result = thongBaoRepo.findByNguoiDungIdOrderByNgayTaoDesc(nguoiDungId, pageable);
        var items = result.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toCollection(ArrayList::new));
        return PageResponse.of(items, result.getTotalElements(), result.getTotalPages(), page);
    }

    @Override
    @Transactional(readOnly = true)
    public long demChuaDoc(Long nguoiDungId) {
        return thongBaoRepo.countByNguoiDungIdAndDaDocFalse(nguoiDungId);
    }

    @Override
    @Transactional
    public void danhDauDaDoc(Long nguoiDungId, Long id) {
        ThongBao tb = thongBaoRepo.findByIdAndNguoiDungId(id, nguoiDungId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTI_001));
        tb.setDaDoc(true);
        thongBaoRepo.save(tb);
    }

    @Override
    @Transactional
    public void danhDauTatCaDaDoc(Long nguoiDungId) {
        thongBaoRepo.danhDauDaDocTatCa(nguoiDungId);
    }

    private ThongBaoResponse toResponse(ThongBao tb) {
        return ThongBaoResponse.builder()
                .id(tb.getId())
                .tieuDe(tb.getTieuDe())
                .noiDung(tb.getNoiDung())
                .loaiThongBao(tb.getLoaiThongBao())
                .daDoc(tb.isDaDoc())
                .thamChieuId(tb.getThamChieuId())
                .ngayTao(tb.getNgayTao())
                .build();
    }
}
