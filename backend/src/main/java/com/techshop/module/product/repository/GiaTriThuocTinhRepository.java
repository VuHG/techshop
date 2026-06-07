package com.techshop.module.product.repository;

import com.techshop.module.product.entity.GiaTriThuocTinh;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GiaTriThuocTinhRepository extends JpaRepository<GiaTriThuocTinh, Long> {

    List<GiaTriThuocTinh> findByThuocTinhIdOrderByThuTuHienThiAscIdAsc(Long thuocTinhId);
}
