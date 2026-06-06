package com.techshop.module.admin.service;

import com.techshop.module.admin.dto.request.DanhMucRequest;
import com.techshop.module.admin.dto.request.PhanLoaiRequest;
import com.techshop.module.admin.dto.response.DanhMucTreeResponse;
import com.techshop.module.product.entity.DanhMuc;
import com.techshop.module.product.entity.PhanLoaiSanPham;
import com.techshop.module.product.repository.DanhMucRepository;
import com.techshop.module.product.repository.PhanLoaiSanPhamRepository;
import com.techshop.module.product.repository.SanPhamRepository;
import com.techshop.shared.exception.AppException;
import com.techshop.shared.exception.ErrorCode;
import com.techshop.shared.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDanhMucService {

    private final DanhMucRepository danhMucRepo;
    private final PhanLoaiSanPhamRepository phanLoaiRepo;
    private final SanPhamRepository sanPhamRepo;

    // ─── Cây danh mục ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<DanhMucTreeResponse> getCay() {
        List<DanhMuc> roots = danhMucRepo.findByDanhMucChaIsNullOrderByThuTuHienThiAsc();
        List<DanhMucTreeResponse> tree = new ArrayList<>();
        for (DanhMuc dm : roots) {
            List<DanhMucTreeResponse.PhanLoaiNode> nodes = phanLoaiRepo.findByDanhMucId(dm.getId())
                    .stream()
                    .map(pl -> DanhMucTreeResponse.PhanLoaiNode.builder()
                            .id(pl.getId())
                            .tenPhanLoai(pl.getTenPhanLoai())
                            .soSanPham(sanPhamRepo.countByPhanLoaiId(pl.getId()))
                            .build())
                    .toList();
            tree.add(DanhMucTreeResponse.builder()
                    .id(dm.getId())
                    .tenDanhMuc(dm.getTenDanhMuc())
                    .slug(dm.getSlug())
                    .trangThai(dm.getTrangThai())
                    .thuTuHienThi(dm.getThuTuHienThi())
                    .phanLoais(nodes)
                    .build());
        }
        return tree;
    }

    // ─── Danh mục gốc ─────────────────────────────────────────────────────

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "danh-muc-cay", allEntries = true),
            @CacheEvict(value = "phan-loai", allEntries = true),
    })
    public void taoDanhMuc(DanhMucRequest req) {
        DanhMuc dm = DanhMuc.builder()
                .tenDanhMuc(req.getTenDanhMuc().trim())
                .slug(sinhSlug(req.getTenDanhMuc(), req.getSlug(), null))
                .thuTuHienThi(req.getThuTuHienThi() == null ? 0 : req.getThuTuHienThi())
                .trangThai(chuanTrangThai(req.getTrangThai()))
                .build();
        danhMucRepo.save(dm);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "danh-muc-cay", allEntries = true),
            @CacheEvict(value = "phan-loai", allEntries = true),
    })
    public void capNhatDanhMuc(Long id, DanhMucRequest req) {
        DanhMuc dm = danhMucRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CAT_001));
        dm.setTenDanhMuc(req.getTenDanhMuc().trim());
        dm.setSlug(sinhSlug(req.getTenDanhMuc(), req.getSlug(), id));
        if (req.getThuTuHienThi() != null) dm.setThuTuHienThi(req.getThuTuHienThi());
        dm.setTrangThai(chuanTrangThai(req.getTrangThai()));
        danhMucRepo.save(dm);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "danh-muc-cay", allEntries = true),
            @CacheEvict(value = "phan-loai", allEntries = true),
    })
    public void doiTrangThai(Long id, String trangThai) {
        DanhMuc dm = danhMucRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CAT_001));
        dm.setTrangThai("AN".equals(trangThai) ? "AN" : "HIEN_THI");
        danhMucRepo.save(dm);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "danh-muc-cay", allEntries = true),
            @CacheEvict(value = "phan-loai", allEntries = true),
    })
    public void xoaDanhMuc(Long id) {
        DanhMuc dm = danhMucRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CAT_001));
        if (phanLoaiRepo.existsByDanhMucId(id) || danhMucRepo.existsByDanhMucChaId(id)) {
            throw new AppException(ErrorCode.CAT_002);
        }
        danhMucRepo.delete(dm);
    }

    // ─── Phân loại ────────────────────────────────────────────────────────

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "danh-muc-cay", allEntries = true),
            @CacheEvict(value = "phan-loai", allEntries = true),
    })
    public void taoPhanLoai(PhanLoaiRequest req) {
        DanhMuc dm = danhMucRepo.findById(req.getDanhMucId())
                .orElseThrow(() -> new AppException(ErrorCode.CAT_001));
        PhanLoaiSanPham pl = PhanLoaiSanPham.builder()
                .tenPhanLoai(req.getTenPhanLoai().trim())
                .danhMuc(dm)
                .build();
        phanLoaiRepo.save(pl);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "danh-muc-cay", allEntries = true),
            @CacheEvict(value = "phan-loai", allEntries = true),
    })
    public void capNhatPhanLoai(Long id, PhanLoaiRequest req) {
        PhanLoaiSanPham pl = phanLoaiRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROD_006));
        pl.setTenPhanLoai(req.getTenPhanLoai().trim());
        if (req.getDanhMucId() != null
                && !req.getDanhMucId().equals(pl.getDanhMuc().getId())) {
            DanhMuc dm = danhMucRepo.findById(req.getDanhMucId())
                    .orElseThrow(() -> new AppException(ErrorCode.CAT_001));
            pl.setDanhMuc(dm);
        }
        phanLoaiRepo.save(pl);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "danh-muc-cay", allEntries = true),
            @CacheEvict(value = "phan-loai", allEntries = true),
    })
    public void xoaPhanLoai(Long id) {
        PhanLoaiSanPham pl = phanLoaiRepo.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROD_006));
        if (sanPhamRepo.countByPhanLoaiId(id) > 0) {
            throw new AppException(ErrorCode.CAT_003);
        }
        phanLoaiRepo.delete(pl);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    private String chuanTrangThai(String tt) {
        return "AN".equals(tt) ? "AN" : "HIEN_THI";
    }

    private String sinhSlug(String ten, String slugReq, Long idHienTai) {
        String base = (slugReq != null && !slugReq.isBlank())
                ? SlugUtil.toSlug(slugReq) : SlugUtil.toSlug(ten);
        if (base.isBlank()) base = "danh-muc";
        String slug = base;
        int i = 2;
        while (idHienTai == null
                ? danhMucRepo.existsBySlug(slug)
                : danhMucRepo.existsBySlugAndIdNot(slug, idHienTai)) {
            slug = base + "-" + i++;
        }
        return slug;
    }
}
