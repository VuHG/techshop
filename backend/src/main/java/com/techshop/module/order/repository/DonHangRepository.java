package com.techshop.module.order.repository;

import com.techshop.module.order.entity.DonHang;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DonHangRepository extends JpaRepository<DonHang, Long> {

    Page<DonHang> findByNguoiDungIdOrderByNgayTaoDesc(Long nguoiDungId, Pageable pageable);

    Page<DonHang> findByNguoiDungIdAndTrangThaiOrderByNgayTaoDesc(
            Long nguoiDungId, String trangThai, Pageable pageable);

    Optional<DonHang> findByIdAndNguoiDungId(Long id, Long nguoiDungId);

    Optional<DonHang> findByMaDonHangAndNguoiDungId(String maDonHang, Long nguoiDungId);

    // Đếm số đơn đã tạo trong ngày để sinh số thứ tự cho ma_don_hang.
    long countByMaDonHangStartingWith(String prefix);
}
