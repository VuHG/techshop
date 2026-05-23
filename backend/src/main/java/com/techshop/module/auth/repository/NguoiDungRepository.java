package com.techshop.module.auth.repository;

import com.techshop.module.auth.entity.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NguoiDungRepository extends JpaRepository<NguoiDung, Long> {
    Optional<NguoiDung> findBySoDienThoai(String soDienThoai);
    boolean existsBySoDienThoai(String soDienThoai);
}
