package com.techshop.module.review.repository;

import com.techshop.module.review.entity.DanhGia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DanhGiaRepository extends JpaRepository<DanhGia, Long> {

    boolean existsByNguoiDungIdAndSanPhamIdAndDonHangId(Long nguoiDungId, Long sanPhamId, Long donHangId);

    Page<DanhGia> findByNguoiDungIdOrderByNgayTaoDesc(Long nguoiDungId, Pageable pageable);

    Page<DanhGia> findBySanPhamIdAndTrangThaiOrderByNgayTaoDesc(
            Long sanPhamId, String trangThai, Pageable pageable);
}
