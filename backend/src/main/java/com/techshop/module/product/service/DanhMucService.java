package com.techshop.module.product.service;

import com.techshop.module.product.dto.response.DanhMucResponse;
import com.techshop.module.product.dto.response.PhanLoaiResponse;
import com.techshop.module.product.entity.ChiTietThuocTinhLoc;
import com.techshop.module.product.entity.DanhMuc;
import com.techshop.module.product.repository.ChiTietThuocTinhLocRepository;
import com.techshop.module.product.repository.DanhMucRepository;
import com.techshop.module.product.repository.PhanLoaiSanPhamRepository;
import com.techshop.shared.exception.AppException;
import com.techshop.shared.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DanhMucService {

    private final DanhMucRepository danhMucRepository;
    private final PhanLoaiSanPhamRepository phanLoaiRepo;
    private final ChiTietThuocTinhLocRepository filterLocRepo;

    @Cacheable("danh-muc-cay")
    public List<DanhMucResponse> getCayDanhMuc() {
        List<DanhMuc> roots = danhMucRepository.findRootCategories();
        return roots.stream().map(this::toDanhMucResponse)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    @Cacheable(value = "phan-loai", key = "#slug")
    public List<PhanLoaiResponse> getPhanLoaiTheoDanhMuc(String slug) {
        danhMucRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(ErrorCode.PROD_001));
        return phanLoaiRepo.findByDanhMucSlug(slug).stream()
                .map(pl -> PhanLoaiResponse.builder()
                        .id(pl.getId())
                        .tenPhanLoai(pl.getTenPhanLoai())
                        .danhMucId(pl.getDanhMuc().getId())
                        .build())
                .collect(Collectors.toCollection(ArrayList::new));
    }

    @Cacheable(value = "filter-schema", key = "#phanLoaiId")
    public Map<String, Object> getFilterSchema(Long phanLoaiId) {
        ChiTietThuocTinhLoc loc = filterLocRepo.findByPhanLoaiId(phanLoaiId)
                .orElseThrow(() -> new AppException(ErrorCode.PROD_001));
        return loc.getThongSoLoc();
    }

    private DanhMucResponse toDanhMucResponse(DanhMuc dm) {
        List<DanhMucResponse> children = dm.getDanhMucCon().stream()
                .filter(c -> "HIEN_THI".equals(c.getTrangThai()))
                .sorted((a, b) -> {
                    int ta = a.getThuTuHienThi() == null ? 0 : a.getThuTuHienThi();
                    int tb = b.getThuTuHienThi() == null ? 0 : b.getThuTuHienThi();
                    return Integer.compare(ta, tb);
                })
                .map(this::toDanhMucResponse)
                .collect(Collectors.toCollection(ArrayList::new));

        return DanhMucResponse.builder()
                .id(dm.getId())
                .tenDanhMuc(dm.getTenDanhMuc())
                .slug(dm.getSlug())
                .thuTuHienThi(dm.getThuTuHienThi())
                .danhMucCon(children)
                .build();
    }
}
