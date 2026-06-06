package com.techshop.module.admin.service;

import com.techshop.module.admin.dto.request.MaGiamGiaRequest;
import com.techshop.module.admin.dto.response.MaGiamGiaResponse;
import com.techshop.module.discount.entity.MaGiamGia;
import com.techshop.module.discount.entity.MaGiamGiaSanPham;
import com.techshop.module.discount.repository.LichSuDungMaRepository;
import com.techshop.module.discount.repository.MaGiamGiaRepository;
import com.techshop.module.discount.repository.MaGiamGiaSanPhamRepository;
import com.techshop.shared.exception.AppException;
import com.techshop.shared.exception.ErrorCode;
import com.techshop.shared.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminMaGiamGiaService {

    private final MaGiamGiaRepository maRepo;
    private final MaGiamGiaSanPhamRepository maSpRepo;
    private final LichSuDungMaRepository lichSuRepo;

    // ─── Danh sách (lọc theo tình trạng suy ra + tìm kiếm) ─────────────────

    @Transactional(readOnly = true)
    public PageResponse<MaGiamGiaResponse> getDanhSach(
            String tinhTrang, String search, int page, int size) {
        // Số lượng mã ít → lọc/suy ra/phân trang trong bộ nhớ cho gọn.
        List<MaGiamGiaResponse> all = maRepo.timKiemAdmin(search == null ? "" : search.trim())
                .stream()
                .map(m -> toResponse(m, false))
                .filter(r -> tinhTrang == null || tinhTrang.isBlank() || tinhTrang.equals(r.getTinhTrang()))
                .toList();

        int total = all.size();
        int from = Math.min(page * size, total);
        int to = Math.min(from + size, total);
        List<MaGiamGiaResponse> items = new ArrayList<>(all.subList(from, to));
        int totalPages = (int) Math.ceil((double) total / size);
        return PageResponse.of(items, total, totalPages, page);
    }

    @Transactional(readOnly = true)
    public MaGiamGiaResponse getChiTiet(Long id) {
        MaGiamGia m = maRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DIS_001));
        MaGiamGiaResponse res = toResponse(m, true);
        res.setSanPhamIds(maSpRepo.findSanPhamIdsByMaGiamGiaId(id));
        res.setLichSu(lichSuRepo.findByMaGiamGiaIdOrderByNgayTaoDesc(id).stream()
                .map(l -> MaGiamGiaResponse.LichSuItem.builder()
                        .nguoiDungId(l.getNguoiDungId())
                        .donHangId(l.getDonHangId())
                        .ngayTao(l.getNgayTao())
                        .build())
                .toList());
        return res;
    }

    // ─── Tạo / Cập nhật ───────────────────────────────────────────────────

    @Transactional
    public MaGiamGiaResponse taoMoi(MaGiamGiaRequest req) {
        validate(req, 0);
        if (maRepo.existsByMaCode(req.getMaCode().trim())) {
            throw new AppException(ErrorCode.DIS_011);
        }
        MaGiamGia m = MaGiamGia.builder()
                .maCode(req.getMaCode().trim())
                .tenMa(req.getTenMa().trim())
                .loaiGiam(req.getLoaiGiam())
                .giaTriGiam(req.getGiaTriGiam())
                .giaTriGiamToiDa(req.getGiaTriGiamToiDa())
                .dieuKienToiThieu(req.getDieuKienToiThieu())
                .soLuongToiDa(req.getSoLuongToiDa())
                .soLuongDaDung(0)
                .batDau(req.getBatDau())
                .ketThuc(req.getKetThuc())
                .trangThai(chuanTrangThai(req.getTrangThai()))
                .build();
        MaGiamGia saved = maRepo.save(m);
        luuSanPhamApDung(saved.getId(), req.getSanPhamIds());
        return getChiTiet(saved.getId());
    }

    @Transactional
    public MaGiamGiaResponse capNhat(Long id, MaGiamGiaRequest req) {
        MaGiamGia m = maRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DIS_001));
        validate(req, m.getSoLuongDaDung());

        if (!m.getMaCode().equals(req.getMaCode().trim())
                && maRepo.existsByMaCodeAndIdNot(req.getMaCode().trim(), id)) {
            throw new AppException(ErrorCode.DIS_011);
        }
        // Không cho đổi loại giảm khi đã có lượt dùng.
        if (m.getSoLuongDaDung() > 0 && !m.getLoaiGiam().equals(req.getLoaiGiam())) {
            throw new AppException(ErrorCode.DIS_010);
        }

        m.setMaCode(req.getMaCode().trim());
        m.setTenMa(req.getTenMa().trim());
        m.setLoaiGiam(req.getLoaiGiam());
        m.setGiaTriGiam(req.getGiaTriGiam());
        m.setGiaTriGiamToiDa(req.getGiaTriGiamToiDa());
        m.setDieuKienToiThieu(req.getDieuKienToiThieu());
        m.setSoLuongToiDa(req.getSoLuongToiDa());
        m.setBatDau(req.getBatDau());
        m.setKetThuc(req.getKetThuc());
        m.setTrangThai(chuanTrangThai(req.getTrangThai()));
        maRepo.save(m);

        maSpRepo.deleteByMaGiamGiaId(id);
        luuSanPhamApDung(id, req.getSanPhamIds());
        return getChiTiet(id);
    }

    @Transactional
    public void doiTrangThai(Long id, String trangThai) {
        MaGiamGia m = maRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DIS_001));
        m.setTrangThai("VO_HIEU".equals(trangThai) ? "VO_HIEU" : "HOAT_DONG");
        maRepo.save(m);
    }

    @Transactional
    public void xoa(Long id) {
        MaGiamGia m = maRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DIS_001));
        if (m.getSoLuongDaDung() > 0) {
            // Đã có người dùng → vô hiệu hóa thay vì xóa (giữ ràng buộc đơn hàng).
            m.setTrangThai("VO_HIEU");
            maRepo.save(m);
            return;
        }
        maSpRepo.deleteByMaGiamGiaId(id);
        maRepo.delete(m);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    private void validate(MaGiamGiaRequest req, int soLuongDaDung) {
        if (!"PHAN_TRAM".equals(req.getLoaiGiam()) && !"SO_TIEN_CO_DINH".equals(req.getLoaiGiam())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        if ("PHAN_TRAM".equals(req.getLoaiGiam())) {
            BigDecimal v = req.getGiaTriGiam();
            if (v.compareTo(BigDecimal.ONE) < 0 || v.compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new AppException(ErrorCode.DIS_007);
            }
        }
        if (req.getKetThuc().isBefore(req.getBatDau())) {
            throw new AppException(ErrorCode.DIS_008);
        }
        if (req.getSoLuongToiDa() < soLuongDaDung) {
            throw new AppException(ErrorCode.DIS_009);
        }
    }

    private void luuSanPhamApDung(Long maId, List<Long> sanPhamIds) {
        if (sanPhamIds == null || sanPhamIds.isEmpty()) return;
        for (Long spId : sanPhamIds) {
            maSpRepo.save(MaGiamGiaSanPham.builder()
                    .maGiamGiaId(maId)
                    .sanPhamId(spId)
                    .build());
        }
    }

    private String chuanTrangThai(String tt) {
        return "VO_HIEU".equals(tt) ? "VO_HIEU" : "HOAT_DONG";
    }

    private MaGiamGiaResponse toResponse(MaGiamGia m, boolean chiTiet) {
        return MaGiamGiaResponse.builder()
                .id(m.getId())
                .maCode(m.getMaCode())
                .tenMa(m.getTenMa())
                .loaiGiam(m.getLoaiGiam())
                .giaTriGiam(m.getGiaTriGiam())
                .giaTriGiamToiDa(m.getGiaTriGiamToiDa())
                .dieuKienToiThieu(m.getDieuKienToiThieu())
                .soLuongToiDa(m.getSoLuongToiDa())
                .soLuongDaDung(m.getSoLuongDaDung())
                .batDau(m.getBatDau())
                .ketThuc(m.getKetThuc())
                .trangThai(m.getTrangThai())
                .tinhTrang(suyRaTinhTrang(m))
                .build();
    }

    private String suyRaTinhTrang(MaGiamGia m) {
        if ("VO_HIEU".equals(m.getTrangThai())) return "VO_HIEU";
        OffsetDateTime now = OffsetDateTime.now();
        if (now.isBefore(m.getBatDau())) return "SAP_TOI";
        if (now.isAfter(m.getKetThuc())) return "DA_KET_THUC";
        return "DANG_DIEN_RA";
    }
}
