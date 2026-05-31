package com.techshop.module.product.repository;

import com.techshop.module.product.entity.ChiTietThuocTinhLoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChiTietThuocTinhLocRepository extends JpaRepository<ChiTietThuocTinhLoc, Long> {

    Optional<ChiTietThuocTinhLoc> findByPhanLoaiId(Long phanLoaiId);

    /** Phân loại có thuộc tính ACTIVE (để đồng bộ toàn bộ). */
    @Query(value = "SELECT DISTINCT phan_loai_id FROM thuoc_tinh WHERE trang_thai = 'ACTIVE'",
            nativeQuery = true)
    List<Long> findPhanLoaiIdsCoThuocTinh();

    /**
     * Dựng lại thong_so_loc của 1 phân loại TỪ thuoc_tinh + gia_tri_thuoc_tinh.
     * thong_so_loc = { ma_thuoc_tinh: { "label": ten_thuoc_tinh, "values": [gia_tri,...] } }.
     * UPSERT theo UNIQUE(phan_loai_id) (thêm ở V7). Đây là NGUỒN tự sinh — không sửa tay.
     */
    @Modifying
    @Query(value = """
            INSERT INTO chi_tiet_thuoc_tinh_loc (phan_loai_id, thong_so_loc, ngay_tao, ngay_cap_nhat)
            SELECT :phanLoaiId,
                   COALESCE((
                     SELECT jsonb_object_agg(x.ma, jsonb_build_object('label', x.label, 'values', x.vals))
                     FROM (
                       SELECT tt.ma_thuoc_tinh AS ma,
                              tt.ten_thuoc_tinh AS label,
                              COALESCE((
                                SELECT jsonb_agg(gt.gia_tri ORDER BY gt.thu_tu_hien_thi, gt.id)
                                FROM gia_tri_thuoc_tinh gt
                                WHERE gt.thuoc_tinh_id = tt.id AND gt.trang_thai = 'ACTIVE'
                              ), '[]'::jsonb) AS vals
                       FROM thuoc_tinh tt
                       WHERE tt.phan_loai_id = :phanLoaiId
                         AND tt.trang_thai = 'ACTIVE'
                         AND tt.ma_thuoc_tinh IS NOT NULL
                     ) x
                   ), '{}'::jsonb),
                   now(), now()
            ON CONFLICT (phan_loai_id)
            DO UPDATE SET thong_so_loc = EXCLUDED.thong_so_loc, ngay_cap_nhat = now()
            """,
            nativeQuery = true)
    int rebuildThongSoLoc(@Param("phanLoaiId") Long phanLoaiId);
}
