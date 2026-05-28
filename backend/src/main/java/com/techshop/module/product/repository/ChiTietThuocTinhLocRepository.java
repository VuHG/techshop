package com.techshop.module.product.repository;

import com.techshop.module.product.entity.ChiTietThuocTinhLoc;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChiTietThuocTinhLocRepository extends JpaRepository<ChiTietThuocTinhLoc, Long> {

    Optional<ChiTietThuocTinhLoc> findByPhanLoaiId(Long phanLoaiId);
}
