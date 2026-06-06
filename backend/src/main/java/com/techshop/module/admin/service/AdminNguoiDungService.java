package com.techshop.module.admin.service;

import com.techshop.module.admin.dto.request.NguoiDungCreateRequest;
import com.techshop.module.admin.dto.request.NguoiDungUpdateRequest;
import com.techshop.module.admin.dto.response.AdminNguoiDungResponse;
import com.techshop.module.auth.entity.NguoiDung;
import com.techshop.module.auth.entity.VaiTro;
import com.techshop.module.auth.repository.NguoiDungRepository;
import com.techshop.module.auth.repository.VaiTroRepository;
import com.techshop.module.order.dto.response.DonHangSummaryResponse;
import com.techshop.module.order.service.DonHangService;
import com.techshop.module.profile.dto.response.DiaChiResponse;
import com.techshop.module.profile.entity.DiaChi;
import com.techshop.module.profile.repository.DiaChiRepository;
import com.techshop.module.order.repository.DonHangRepository;
import com.techshop.module.review.repository.DanhGiaRepository;
import com.techshop.shared.exception.AppException;
import com.techshop.shared.exception.ErrorCode;
import com.techshop.shared.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminNguoiDungService {

    private final NguoiDungRepository nguoiDungRepo;
    private final VaiTroRepository vaiTroRepo;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate redisTemplate;
    private final DonHangRepository donHangRepo;
    private final DiaChiRepository diaChiRepo;
    private final DanhGiaRepository danhGiaRepo;
    private final DonHangService donHangService;

    private static final String REDIS_REFRESH_KEY = "rt:";
    private static final Set<String> VAI_TRO_HOP_LE = Set.of("CUSTOMER", "ADMIN");

    // ─── Danh sách ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PageResponse<AdminNguoiDungResponse> getDanhSach(
            String vaiTro, String trangThai, String search, int page, int size) {
        Page<NguoiDung> result = nguoiDungRepo.timKiemAdmin(
                vaiTro == null ? "" : vaiTro.trim(),
                trangThai == null ? "" : trangThai.trim(),
                search == null ? "" : search.trim(),
                PageRequest.of(page, size));

        List<AdminNguoiDungResponse> items = result.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toCollection(ArrayList::new));
        return PageResponse.of(items, result.getTotalElements(), result.getTotalPages(), page);
    }

    @Transactional(readOnly = true)
    public AdminNguoiDungResponse getChiTiet(Long id) {
        NguoiDung nd = nguoiDungRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_001));
        AdminNguoiDungResponse res = toResponse(nd);
        res.setThongKe(AdminNguoiDungResponse.ThongKe.builder()
                .soDon(donHangRepo.countByNguoiDungId(id))
                .soDanhGia(danhGiaRepo.countByNguoiDungId(id))
                .soDiaChi(diaChiRepo.countByNguoiDungId(id))
                .build());
        res.setDiaChis(diaChiRepo.findByNguoiDungIdOrderByLaMacDinhDescNgayTaoDesc(id).stream()
                .map(this::toDiaChi).collect(Collectors.toList()));
        return res;
    }

    @Transactional(readOnly = true)
    public PageResponse<DonHangSummaryResponse> getDonHang(Long id, int page, int size) {
        return donHangService.getDanhSach(id, null, page, size);
    }

    // ─── Tạo / Cập nhật ───────────────────────────────────────────────────

    @Transactional
    public AdminNguoiDungResponse taoMoi(NguoiDungCreateRequest req) {
        if (nguoiDungRepo.existsBySoDienThoai(req.getSoDienThoai().trim())) {
            throw new AppException(ErrorCode.AUTH_001);
        }
        if (req.getEmail() != null && !req.getEmail().isBlank()
                && nguoiDungRepo.existsByEmail(req.getEmail().trim())) {
            throw new AppException(ErrorCode.PROFILE_001);
        }
        VaiTro vaiTro = taiVaiTro(req.getVaiTro());

        NguoiDung nd = NguoiDung.builder()
                .hoTen(req.getHoTen().trim())
                .soDienThoai(req.getSoDienThoai().trim())
                .email(req.getEmail() == null || req.getEmail().isBlank() ? null : req.getEmail().trim())
                .ngaySinh(req.getNgaySinh())
                .matKhau(passwordEncoder.encode(req.getMatKhau()))
                .vaiTro(vaiTro)
                .trangThai("HOAT_DONG")
                .daXacThuc(true)
                .build();
        return toResponse(nguoiDungRepo.save(nd));
    }

    @Transactional
    public AdminNguoiDungResponse capNhat(Long actingAdminId, Long id, NguoiDungUpdateRequest req) {
        NguoiDung nd = nguoiDungRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_001));
        kiemTraGuard(actingAdminId, nd);

        if (req.getEmail() != null && !req.getEmail().isBlank()
                && nguoiDungRepo.existsByEmailAndIdNot(req.getEmail().trim(), id)) {
            throw new AppException(ErrorCode.PROFILE_001);
        }
        nd.setHoTen(req.getHoTen().trim());
        nd.setEmail(req.getEmail() == null || req.getEmail().isBlank() ? null : req.getEmail().trim());
        nd.setNgaySinh(req.getNgaySinh());
        nd.setVaiTro(taiVaiTro(req.getVaiTro()));
        return toResponse(nguoiDungRepo.save(nd));
    }

    @Transactional
    public void doiTrangThai(Long actingAdminId, Long id, String trangThai) {
        NguoiDung nd = nguoiDungRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_001));
        kiemTraGuard(actingAdminId, nd);

        boolean khoa = "BI_KHOA".equals(trangThai);
        nd.setTrangThai(khoa ? "BI_KHOA" : "HOAT_DONG");
        nguoiDungRepo.save(nd);
        // Khóa → thu hồi refresh token để vô hiệu phiên đang mở.
        if (khoa) {
            redisTemplate.delete(REDIS_REFRESH_KEY + id);
        }
    }

    @Transactional
    public void resetMatKhau(Long actingAdminId, Long id, String matKhauMoi) {
        NguoiDung nd = nguoiDungRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_001));
        kiemTraGuard(actingAdminId, nd);
        nd.setMatKhau(passwordEncoder.encode(matKhauMoi));
        nguoiDungRepo.save(nd);
        redisTemplate.delete(REDIS_REFRESH_KEY + id);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    // Không cho thao tác trên tài khoản ADMIN khác (chỉ được tự sửa chính mình).
    private void kiemTraGuard(Long actingAdminId, NguoiDung target) {
        if ("ADMIN".equals(target.getVaiTro().getTenVaiTro())
                && !target.getId().equals(actingAdminId)) {
            throw new AppException(ErrorCode.USER_002);
        }
    }

    private VaiTro taiVaiTro(String ten) {
        if (ten == null || !VAI_TRO_HOP_LE.contains(ten)) {
            throw new AppException(ErrorCode.USER_003);
        }
        return vaiTroRepo.findByTenVaiTro(ten)
                .orElseThrow(() -> new AppException(ErrorCode.USER_003));
    }

    private AdminNguoiDungResponse toResponse(NguoiDung nd) {
        return AdminNguoiDungResponse.builder()
                .id(nd.getId())
                .hoTen(nd.getHoTen())
                .soDienThoai(nd.getSoDienThoai())
                .email(nd.getEmail())
                .ngaySinh(nd.getNgaySinh())
                .vaiTro(nd.getVaiTro().getTenVaiTro())
                .trangThai(nd.getTrangThai())
                .ngayTao(nd.getNgayTao())
                .build();
    }

    private DiaChiResponse toDiaChi(DiaChi d) {
        String dayDu = String.join(", ", d.getDiaChiChiTiet(), d.getPhuongXa(),
                d.getQuanHuyen(), d.getTinhThanh());
        return DiaChiResponse.builder()
                .id(d.getId())
                .hoTenNguoiNhan(d.getHoTenNguoiNhan())
                .soDienThoai(d.getSoDienThoai())
                .diaChiChiTiet(d.getDiaChiChiTiet())
                .phuongXa(d.getPhuongXa())
                .quanHuyen(d.getQuanHuyen())
                .tinhThanh(d.getTinhThanh())
                .laMacDinh(d.isLaMacDinh())
                .diaChiDayDu(dayDu)
                .build();
    }
}
