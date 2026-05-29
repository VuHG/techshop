package com.techshop.module.notification.repository;

import com.techshop.module.notification.entity.ThongBao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ThongBaoRepository extends JpaRepository<ThongBao, Long> {

    Page<ThongBao> findByNguoiDungIdOrderByNgayTaoDesc(Long nguoiDungId, Pageable pageable);

    long countByNguoiDungIdAndDaDocFalse(Long nguoiDungId);

    Optional<ThongBao> findByIdAndNguoiDungId(Long id, Long nguoiDungId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE ThongBao t SET t.daDoc = true WHERE t.nguoiDungId = :nguoiDungId AND t.daDoc = false")
    void danhDauDaDocTatCa(@Param("nguoiDungId") Long nguoiDungId);
}
