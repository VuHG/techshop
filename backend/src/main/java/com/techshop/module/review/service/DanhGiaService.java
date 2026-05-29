package com.techshop.module.review.service;

import com.techshop.module.order.service.OrderQueryService;
import com.techshop.module.product.dto.BienTheInfo;
import com.techshop.module.product.service.ProductQueryService;
import com.techshop.module.review.dto.request.TaoDanhGiaRequest;
import com.techshop.module.review.dto.response.DanhGiaResponse;
import com.techshop.module.review.entity.DanhGia;
import com.techshop.module.review.repository.DanhGiaRepository;
import com.techshop.shared.exception.AppException;
import com.techshop.shared.exception.ErrorCode;
import com.techshop.shared.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DanhGiaService {

    private final DanhGiaRepository danhGiaRepo;
    private final ProductQueryService productQueryService;
    private final OrderQueryService orderQueryService;

    @Transactional
    public DanhGiaResponse taoDanhGia(Long nguoiDungId, TaoDanhGiaRequest req) {
        // Lấy sản phẩm cha từ biến thể (đồng thời xác thực biến thể tồn tại → PROD_002).
        BienTheInfo info = productQueryService.layThongTinBienThe(req.getBienTheId());
        Long sanPhamId = info.getSanPhamId();

        // Đơn phải thuộc user, đã HOAN_THANH và chứa biến thể này.
        if (!orderQueryService.kiemTraDonChoDanhGia(req.getDonHangId(), nguoiDungId, req.getBienTheId())) {
            throw new AppException(ErrorCode.REV_001);
        }

        // Mỗi sản phẩm trong 1 đơn chỉ đánh giá 1 lần.
        if (danhGiaRepo.existsByNguoiDungIdAndSanPhamIdAndDonHangId(nguoiDungId, sanPhamId, req.getDonHangId())) {
            throw new AppException(ErrorCode.REV_002);
        }

        DanhGia dg = DanhGia.builder()
                .nguoiDungId(nguoiDungId)
                .sanPhamId(sanPhamId)
                .donHangId(req.getDonHangId())
                .diemDanhGia((short) (int) req.getDiem())
                .noiDung(req.getNoiDung())
                .trangThai("DA_DUYET")
                .build();
        danhGiaRepo.save(dg);

        // Cập nhật cache điểm trung bình của sản phẩm.
        productQueryService.capNhatDiemDanhGia(sanPhamId, req.getDiem());

        return toResponse(dg);
    }

    @Transactional(readOnly = true)
    public PageResponse<DanhGiaResponse> getCuaToi(Long nguoiDungId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<DanhGia> result = danhGiaRepo.findByNguoiDungIdOrderByNgayTaoDesc(nguoiDungId, pageable);
        return toPage(result, page);
    }

    @Transactional(readOnly = true)
    public PageResponse<DanhGiaResponse> getTheoSanPham(Long sanPhamId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<DanhGia> result = danhGiaRepo
                .findBySanPhamIdAndTrangThaiOrderByNgayTaoDesc(sanPhamId, "DA_DUYET", pageable);
        return toPage(result, page);
    }

    // ─── Helpers ─────────────────────────────────────────────────────

    private PageResponse<DanhGiaResponse> toPage(Page<DanhGia> result, int page) {
        var items = result.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toCollection(ArrayList::new));
        return PageResponse.of(items, result.getTotalElements(), result.getTotalPages(), page);
    }

    private DanhGiaResponse toResponse(DanhGia dg) {
        return DanhGiaResponse.builder()
                .id(dg.getId())
                .sanPhamId(dg.getSanPhamId())
                .donHangId(dg.getDonHangId())
                .diem(dg.getDiemDanhGia())
                .noiDung(dg.getNoiDung())
                .ngayTao(dg.getNgayTao())
                .build();
    }
}
