package com.techshop.module.profile.repository;

import com.techshop.module.profile.entity.DiaChi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DiaChiRepository extends JpaRepository<DiaChi, Long> {

    List<DiaChi> findByNguoiDungIdOrderByLaMacDinhDescNgayTaoDesc(Long nguoiDungId);

    Optional<DiaChi> findByIdAndNguoiDungId(Long id, Long nguoiDungId);

    long countByNguoiDungId(Long nguoiDungId);

    // Gỡ cờ mặc định ở mọi địa chỉ của user trước khi set 1 địa chỉ làm mặc định.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE DiaChi d SET d.laMacDinh = false WHERE d.nguoiDungId = :nguoiDungId")
    void goCoMacDinh(@Param("nguoiDungId") Long nguoiDungId);
}
