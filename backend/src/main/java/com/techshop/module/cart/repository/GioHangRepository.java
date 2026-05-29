package com.techshop.module.cart.repository;

import com.techshop.module.cart.entity.GioHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GioHangRepository extends JpaRepository<GioHang, Long> {

    List<GioHang> findByNguoiDungIdOrderByNgayTaoDesc(Long nguoiDungId);

    Optional<GioHang> findByNguoiDungIdAndBienTheId(Long nguoiDungId, Long bienTheId);

    Optional<GioHang> findByIdAndNguoiDungId(Long id, Long nguoiDungId);

    List<GioHang> findByNguoiDungIdAndIdIn(Long nguoiDungId, List<Long> ids);

    @Modifying
    @Query("DELETE FROM GioHang g WHERE g.nguoiDungId = :nguoiDungId AND g.id IN :ids")
    void deleteByNguoiDungIdAndIdIn(@Param("nguoiDungId") Long nguoiDungId, @Param("ids") List<Long> ids);

    @Modifying
    @Query("DELETE FROM GioHang g WHERE g.nguoiDungId = :nguoiDungId")
    void deleteByNguoiDungId(@Param("nguoiDungId") Long nguoiDungId);
}
