package com.techshop.module.product.repository;

import com.techshop.module.product.entity.ThuocTinh;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ThuocTinhRepository extends JpaRepository<ThuocTinh, Long> {

    List<ThuocTinh> findByPhanLoaiIdAndTrangThaiOrderByThuTuHienThiAscIdAsc(Long phanLoaiId, String trangThai);

    boolean existsByPhanLoaiIdAndMaThuocTinhAndTrangThai(Long phanLoaiId, String maThuocTinh, String trangThai);
}
