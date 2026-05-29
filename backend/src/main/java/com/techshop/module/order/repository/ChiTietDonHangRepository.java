package com.techshop.module.order.repository;

import com.techshop.module.order.entity.ChiTietDonHang;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChiTietDonHangRepository extends JpaRepository<ChiTietDonHang, Long> {

    boolean existsByDonHang_IdAndBienTheId(Long donHangId, Long bienTheId);
}
