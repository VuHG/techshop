package com.techshop.module.auth.repository;

import com.techshop.module.auth.entity.MatKhauReset;
import com.techshop.module.auth.entity.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MatKhauResetRepository extends JpaRepository<MatKhauReset, Long> {
    Optional<MatKhauReset> findTopByNguoiDungAndDaSuDungFalseOrderByNgayTaoDesc(NguoiDung nguoiDung);
}
