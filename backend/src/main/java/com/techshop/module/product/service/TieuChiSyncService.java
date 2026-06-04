package com.techshop.module.product.service;

import com.techshop.module.product.repository.ChiTietThuocTinhLocRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Đồng bộ field thong_so_loc (filter schema JSONB) từ bảng thuoc_tinh + gia_tri_thuoc_tinh.
 * thong_so_loc là NGUỒN TỰ SINH — KHÔNG sửa tay. Gọi dongBoMot() mỗi khi dữ liệu
 * thuộc tính của một phân loại thay đổi (Admin thêm/sửa thuoc_tinh/gia_tri_thuoc_tinh).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TieuChiSyncService {

    private final ChiTietThuocTinhLocRepository locRepo;

    @Transactional
    @CacheEvict(value = "filter-schema", key = "#phanLoaiId")
    public void dongBoMot(Long phanLoaiId) {
        locRepo.rebuildThongSoLoc(phanLoaiId);
        log.info("Đồng bộ thong_so_loc cho phân loại {}", phanLoaiId);
    }

    @Transactional
    @CacheEvict(value = "filter-schema", allEntries = true)
    public int dongBoTatCa() {
        List<Long> ids = locRepo.findPhanLoaiIdsCoThuocTinh();
        ids.forEach(locRepo::rebuildThongSoLoc);
        log.info("Đồng bộ thong_so_loc cho {} phân loại", ids.size());
        return ids.size();
    }
}
