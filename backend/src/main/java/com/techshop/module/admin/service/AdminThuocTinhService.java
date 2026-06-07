package com.techshop.module.admin.service;

import com.techshop.module.admin.dto.request.ThuocTinhRequest;
import com.techshop.module.admin.dto.response.ThuocTinhResponse;
import com.techshop.module.product.entity.GiaTriThuocTinh;
import com.techshop.module.product.entity.ThuocTinh;
import com.techshop.module.product.repository.GiaTriThuocTinhRepository;
import com.techshop.module.product.repository.PhanLoaiSanPhamRepository;
import com.techshop.module.product.repository.ThuocTinhRepository;
import com.techshop.module.product.service.TieuChiSyncService;
import com.techshop.shared.exception.AppException;
import com.techshop.shared.exception.ErrorCode;
import com.techshop.shared.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Quản lý thuộc tính + giá trị của phân loại. Xóa dùng cơ chế "mềm" qua trang_thai
 * (INACTIVE) để tránh vỡ FK bien_the_gia_tri_thuoc_tinh, và khớp auto-sync chỉ lấy ACTIVE.
 * Sau mỗi thay đổi → dongBoMot() dựng lại thong_so_loc cho phân loại.
 */
@Service
@RequiredArgsConstructor
public class AdminThuocTinhService {

    private final ThuocTinhRepository thuocTinhRepo;
    private final GiaTriThuocTinhRepository giaTriRepo;
    private final PhanLoaiSanPhamRepository phanLoaiRepo;
    private final TieuChiSyncService tieuChiSyncService;

    private static final String ACTIVE = "ACTIVE";
    private static final String INACTIVE = "INACTIVE";
    private static final String APPROVED = "APPROVED";

    @Transactional(readOnly = true)
    public List<ThuocTinhResponse> getDanhSach(Long phanLoaiId) {
        return thuocTinhRepo.findByPhanLoaiIdAndTrangThaiOrderByThuTuHienThiAscIdAsc(phanLoaiId, ACTIVE)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ThuocTinhResponse taoMoi(ThuocTinhRequest req) {
        if (req.getPhanLoaiId() == null || !phanLoaiRepo.existsById(req.getPhanLoaiId())) {
            throw new AppException(ErrorCode.PROD_006);
        }
        ThuocTinh tt = ThuocTinh.builder()
                .tenThuocTinh(req.getTenThuocTinh().trim())
                .phanLoaiId(req.getPhanLoaiId())
                .maThuocTinh(sinhMa(req.getMaThuocTinh(), req.getTenThuocTinh()))
                .kieuDuLieu(req.getKieuDuLieu() == null || req.getKieuDuLieu().isBlank() ? "STRING" : req.getKieuDuLieu())
                .thuTuHienThi(req.getThuTuHienThi() == null ? 0 : req.getThuTuHienThi())
                .trangThaiDuyet(APPROVED)
                .trangThai(ACTIVE)
                .build();
        ThuocTinh saved = thuocTinhRepo.save(tt);
        dongBoGiaTri(saved.getId(), req.getGiaTris());
        tieuChiSyncService.dongBoMot(saved.getPhanLoaiId());
        return toResponse(saved);
    }

    @Transactional
    public ThuocTinhResponse capNhat(Long id, ThuocTinhRequest req) {
        ThuocTinh tt = thuocTinhRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ATTR_001));
        tt.setTenThuocTinh(req.getTenThuocTinh().trim());
        tt.setMaThuocTinh(sinhMa(req.getMaThuocTinh(), req.getTenThuocTinh()));
        if (req.getKieuDuLieu() != null && !req.getKieuDuLieu().isBlank()) tt.setKieuDuLieu(req.getKieuDuLieu());
        if (req.getThuTuHienThi() != null) tt.setThuTuHienThi(req.getThuTuHienThi());
        thuocTinhRepo.save(tt);

        dongBoGiaTri(id, req.getGiaTris());
        tieuChiSyncService.dongBoMot(tt.getPhanLoaiId());
        return toResponse(tt);
    }

    @Transactional
    public void xoa(Long id) {
        ThuocTinh tt = thuocTinhRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ATTR_001));
        tt.setTrangThai(INACTIVE);
        thuocTinhRepo.save(tt);
        giaTriRepo.findByThuocTinhIdOrderByThuTuHienThiAscIdAsc(id)
                .forEach(g -> g.setTrangThai(INACTIVE));
        tieuChiSyncService.dongBoMot(tt.getPhanLoaiId());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    // Đồng bộ giá trị: kích hoạt lại giá trị trùng, ẩn giá trị bị bỏ, thêm giá trị mới — theo thứ tự.
    private void dongBoGiaTri(Long thuocTinhId, List<String> giaTris) {
        List<String> sach = giaTris == null ? List.of()
                : new ArrayList<>(new LinkedHashSet<>(giaTris.stream()
                        .filter(s -> s != null && !s.isBlank()).map(String::trim).toList()));

        List<GiaTriThuocTinh> existing = giaTriRepo.findByThuocTinhIdOrderByThuTuHienThiAscIdAsc(thuocTinhId);
        Map<String, GiaTriThuocTinh> byVal = existing.stream()
                .collect(Collectors.toMap(GiaTriThuocTinh::getGiaTri, Function.identity(), (a, b) -> a));

        existing.forEach(g -> g.setTrangThai(INACTIVE));

        int thuTu = 1;
        for (String val : sach) {
            GiaTriThuocTinh g = byVal.get(val);
            if (g == null) {
                g = GiaTriThuocTinh.builder()
                        .thuocTinhId(thuocTinhId)
                        .giaTri(val)
                        .thuTuHienThi(thuTu)
                        .trangThaiDuyet(APPROVED)
                        .trangThai(ACTIVE)
                        .build();
            } else {
                g.setTrangThai(ACTIVE);
                g.setThuTuHienThi(thuTu);
            }
            giaTriRepo.save(g);
            thuTu++;
        }
    }

    private String sinhMa(String maReq, String ten) {
        String base = (maReq != null && !maReq.isBlank())
                ? maReq.trim() : SlugUtil.toSlug(ten).replace('-', '_');
        return base.isBlank() ? "thuoc_tinh" : base;
    }

    private ThuocTinhResponse toResponse(ThuocTinh tt) {
        List<ThuocTinhResponse.GiaTriItem> giaTris =
                giaTriRepo.findByThuocTinhIdOrderByThuTuHienThiAscIdAsc(tt.getId()).stream()
                        .filter(g -> ACTIVE.equals(g.getTrangThai()))
                        .map(g -> ThuocTinhResponse.GiaTriItem.builder()
                                .id(g.getId()).giaTri(g.getGiaTri()).build())
                        .collect(Collectors.toList());
        return ThuocTinhResponse.builder()
                .id(tt.getId())
                .tenThuocTinh(tt.getTenThuocTinh())
                .maThuocTinh(tt.getMaThuocTinh())
                .kieuDuLieu(tt.getKieuDuLieu())
                .thuTuHienThi(tt.getThuTuHienThi())
                .giaTris(giaTris)
                .build();
    }
}
