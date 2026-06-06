package com.techshop.module.order.repository;

import com.techshop.module.order.entity.DonHang;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DonHangRepository extends JpaRepository<DonHang, Long> {

    Page<DonHang> findByNguoiDungIdOrderByNgayTaoDesc(Long nguoiDungId, Pageable pageable);

    Page<DonHang> findByNguoiDungIdAndTrangThaiOrderByNgayTaoDesc(
            Long nguoiDungId, String trangThai, Pageable pageable);

    Optional<DonHang> findByIdAndNguoiDungId(Long id, Long nguoiDungId);

    Optional<DonHang> findByMaDonHangAndNguoiDungId(String maDonHang, Long nguoiDungId);

    // Đếm số đơn đã tạo trong ngày để sinh số thứ tự cho ma_don_hang.
    long countByMaDonHangStartingWith(String prefix);

    // ─── Admin (toàn hệ thống, không lọc theo nguoiDungId) ───────────────
    // Lọc trạng thái + tìm theo mã đơn / tên người nhận / SĐT.
    // Dùng mẹo chuỗi rỗng = "không lọc" để tránh lỗi PostgreSQL 42P18 với tham số NULL.
    @Query("""
            SELECT d FROM DonHang d
            WHERE (:trangThai = '' OR d.trangThai = :trangThai)
              AND (:search = ''
                   OR LOWER(d.maDonHang) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(d.hoTenNguoiNhan) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR d.soDienThoaiNhan LIKE CONCAT('%', :search, '%'))
            ORDER BY d.ngayTao DESC
            """)
    Page<DonHang> timKiemAdmin(@Param("trangThai") String trangThai,
                               @Param("search") String search,
                               Pageable pageable);

    // Đếm đơn theo từng trạng thái (cho badge các tab).
    @Query("SELECT d.trangThai, COUNT(d) FROM DonHang d GROUP BY d.trangThai")
    List<Object[]> demTheoTrangThai();

    long countByNguoiDungId(Long nguoiDungId);

    // ─── Dashboard ────────────────────────────────────────────────────────
    // Doanh thu = tổng tong_thanh_toan của đơn không bị hủy trong khoảng.
    @Query("""
            SELECT COALESCE(SUM(d.tongThanhToan), 0) FROM DonHang d
            WHERE d.trangThai <> 'DA_HUY' AND d.ngayTao >= :from AND d.ngayTao < :to
            """)
    java.math.BigDecimal tinhDoanhThu(@Param("from") java.time.OffsetDateTime from,
                                      @Param("to") java.time.OffsetDateTime to);

    long countByNgayTaoBetween(java.time.OffsetDateTime from, java.time.OffsetDateTime to);

    long countByTrangThai(String trangThai);

    // Doanh thu theo ngày (cho biểu đồ đường).
    @Query(value = """
            SELECT CAST(dh.ngay_tao AS date) AS ngay, COALESCE(SUM(dh.tong_thanh_toan), 0) AS doanh_thu
            FROM don_hang dh
            WHERE dh.trang_thai <> 'DA_HUY' AND dh.ngay_tao >= :from
            GROUP BY CAST(dh.ngay_tao AS date)
            ORDER BY ngay
            """, nativeQuery = true)
    List<Object[]> doanhThuTheoNgay(@Param("from") java.time.OffsetDateTime from);
}
