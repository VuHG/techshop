package com.techshop.module.auth.repository;

import com.techshop.module.auth.entity.NguoiDung;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface NguoiDungRepository extends JpaRepository<NguoiDung, Long> {
    Optional<NguoiDung> findBySoDienThoai(String soDienThoai);
    boolean existsBySoDienThoai(String soDienThoai);
    boolean existsByEmailAndIdNot(String email, Long id);
    boolean existsByEmail(String email);

    // ─── Admin: lọc vai trò / trạng thái + tìm theo tên/SĐT/email ─────────
    @Query("""
            SELECT n FROM NguoiDung n JOIN n.vaiTro v
            WHERE (:vaiTro = '' OR v.tenVaiTro = :vaiTro)
              AND (:trangThai = '' OR n.trangThai = :trangThai)
              AND (:search = ''
                   OR LOWER(n.hoTen) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR n.soDienThoai LIKE CONCAT('%', :search, '%')
                   OR LOWER(COALESCE(n.email, '')) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY n.ngayTao DESC
            """)
    Page<NguoiDung> timKiemAdmin(@Param("vaiTro") String vaiTro,
                                 @Param("trangThai") String trangThai,
                                 @Param("search") String search,
                                 Pageable pageable);

    long countByNgayTaoAfter(java.time.OffsetDateTime moc);

    long countByNgayTaoBetween(java.time.OffsetDateTime from, java.time.OffsetDateTime to);
}
