package com.techshop.module.order.repository;

import com.techshop.module.order.entity.ChiTietDonHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ChiTietDonHangRepository extends JpaRepository<ChiTietDonHang, Long> {

    boolean existsByDonHang_IdAndBienTheId(Long donHangId, Long bienTheId);

    // Admin: kiểm tra biến thể sản phẩm đã từng xuất hiện trong đơn nào chưa (quyết định xóa cứng/mềm).
    boolean existsByBienTheIdIn(Collection<Long> bienTheIds);

    // Dashboard: doanh thu theo danh mục (join về catalog — chỉ dùng cho thống kê, không phải đọc đơn).
    @Query(value = """
            SELECT dm.ten_danh_muc, COALESCE(SUM(ct.thanh_tien), 0) AS doanh_thu
            FROM chi_tiet_don_hang ct
            JOIN don_hang dh ON ct.don_hang_id = dh.id
            JOIN bien_the_san_pham bt ON ct.bien_the_id = bt.id
            JOIN san_pham sp ON bt.san_pham_id = sp.id
            JOIN phan_loai_san_pham pl ON sp.phan_loai_id = pl.id
            JOIN danh_muc dm ON pl.danh_muc_id = dm.id
            WHERE dh.trang_thai = 'HOAN_THANH' AND dh.ngay_tao >= :from
            GROUP BY dm.ten_danh_muc
            ORDER BY doanh_thu DESC
            """, nativeQuery = true)
    List<Object[]> doanhThuTheoDanhMuc(@Param("from") java.time.OffsetDateTime from);
}
