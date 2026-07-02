package com.techshop.module.dexuat.repository;

import com.techshop.module.dexuat.entity.DeXuatGia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface DeXuatGiaRepository extends JpaRepository<DeXuatGia, Long> {

    List<DeXuatGia> findByTrangThaiOrderByNgayTaoDesc(String trangThai);

    boolean existsByBienTheIdAndTrangThai(Long bienTheId, String trangThai);

    /**
     * Thống kê biến thể CON_HANG kèm giá thị trường (mock) để engine đề xuất giá.
     * Trả Object[]: [0]=bienTheId(Long) [1]=tenSanPham(String) [2]=mauSac(String)
     * [3]=gia(BigDecimal) [4]=giaKhuyenMai(BigDecimal|null) [5]=soLuongTon(Integer)
     * [6]=soLuotBan(Integer) [7]=giaThiTruong(BigDecimal|null)
     */
    @Query(value = """
            SELECT bt.id, bt.ten_san_pham, bt.mau_sac, bt.gia, bt.gia_khuyen_mai,
                   bt.so_luong_ton, bt.so_luot_ban, g.gia_thi_truong
            FROM bien_the_san_pham bt
            LEFT JOIN gia_thi_truong g ON g.bien_the_id = bt.id
            WHERE bt.trang_thai = 'CON_HANG'
            """, nativeQuery = true)
    List<Object[]> layThongKeBienThe();

    /** Đề xuất CHO_DUYET quá hạn → HET_HAN (tự biến mất khỏi danh sách). */
    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE DeXuatGia d SET d.trangThai = 'HET_HAN'
            WHERE d.trangThai = 'CHO_DUYET' AND d.ngayHetHan < :now
            """)
    int danhDauHetHan(@Param("now") OffsetDateTime now);
}
