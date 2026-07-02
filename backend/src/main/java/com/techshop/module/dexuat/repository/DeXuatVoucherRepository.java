package com.techshop.module.dexuat.repository;

import com.techshop.module.dexuat.entity.DeXuatVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface DeXuatVoucherRepository extends JpaRepository<DeXuatVoucher, Long> {

    List<DeXuatVoucher> findByTrangThaiOrderByNgayTaoDesc(String trangThai);

    boolean existsBySanPhamIdAndTrangThai(Long sanPhamId, String trangThai);

    boolean existsByPhamViAndTrangThai(String phamVi, String trangThai);

    /**
     * Sản phẩm CON_HANG tồn cao & bán chậm → ứng viên đề xuất voucher theo sản phẩm.
     * Trả Object[]: [0]=sanPhamId(Long) [1]=tenSanPham(String) [2]=tongTon(Number) [3]=tongBan(Number)
     */
    @Query(value = """
            SELECT sp.id, sp.ten_san_pham,
                   COALESCE(SUM(bt.so_luong_ton), 0), COALESCE(SUM(bt.so_luot_ban), 0)
            FROM san_pham sp
            JOIN bien_the_san_pham bt ON bt.san_pham_id = sp.id
            WHERE sp.trang_thai = 'CON_HANG'
            GROUP BY sp.id, sp.ten_san_pham
            HAVING COALESCE(SUM(bt.so_luong_ton), 0) >= :tonMin
               AND COALESCE(SUM(bt.so_luot_ban), 0) <= :banMax
            ORDER BY COALESCE(SUM(bt.so_luong_ton), 0) DESC
            """, nativeQuery = true)
    List<Object[]> timSanPhamTonCaoBanCham(@Param("tonMin") int tonMin, @Param("banMax") int banMax);

    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE DeXuatVoucher d SET d.trangThai = 'HET_HAN'
            WHERE d.trangThai = 'CHO_DUYET' AND d.ngayHetHan < :now
            """)
    int danhDauHetHan(@Param("now") OffsetDateTime now);
}
