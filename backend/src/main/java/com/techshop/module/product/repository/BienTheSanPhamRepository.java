package com.techshop.module.product.repository;

import com.techshop.module.product.entity.BienTheSanPham;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface BienTheSanPhamRepository extends JpaRepository<BienTheSanPham, Long> {

    // Danh sách CARD THEO BIẾN THỂ (1 biến thể = 1 card). Native vì cần lọc JSONB (@>) + sort động.
    // ORDER BY nhúng trong câu lệnh (Pageable truyền unsorted, chỉ dùng cho limit/offset) để
    // tránh "ambiguous column" khi JOIN (cả bt lẫn sp đều có ngay_tao/trang_thai).
    // :khuyenMai=true → chỉ biến thể có gia_khuyen_mai < gia. Lọc tiêu chí gộp specs SP + biến thể.
    @Query(value = """
            SELECT bt.* FROM bien_the_san_pham bt
            JOIN san_pham sp ON bt.san_pham_id = sp.id
            WHERE bt.trang_thai IN ('CON_HANG','HET_HANG') AND sp.trang_thai = 'CON_HANG'
            AND (CAST(:phanLoaiId AS bigint) IS NULL OR sp.phan_loai_id = :phanLoaiId)
            AND (CAST(:search AS text) IS NULL OR LOWER(sp.ten_san_pham) LIKE :search)
            AND (CAST(:minPrice AS numeric) IS NULL OR COALESCE(bt.gia_khuyen_mai, bt.gia) >= :minPrice)
            AND (CAST(:maxPrice AS numeric) IS NULL OR COALESCE(bt.gia_khuyen_mai, bt.gia) <= :maxPrice)
            AND (:khuyenMai = 0 OR (bt.gia_khuyen_mai IS NOT NULL AND bt.gia_khuyen_mai < bt.gia))
            AND (CAST(:thongSo AS text) IS NULL
                 OR bt.thong_so_bien_the @> CAST(:thongSo AS jsonb))
            AND (CAST(:nhanMa AS text) IS NULL OR EXISTS (
                 SELECT 1 FROM bien_the_nhan bn JOIN nhan_san_pham n ON bn.nhan_id = n.id
                 WHERE bn.bien_the_id = bt.id AND n.ma_nhan = :nhanMa))
            ORDER BY
                CASE WHEN bt.trang_thai = 'CON_HANG' THEN 0 ELSE 1 END,
                CASE WHEN :sortBy = 'rating'     THEN sp.diem_danh_gia_tb END DESC NULLS LAST,
                CASE WHEN :sortBy = 'sold'       THEN sp.so_luot_ban END DESC NULLS LAST,
                CASE WHEN :sortBy = 'price_asc'  THEN COALESCE(bt.gia_khuyen_mai, bt.gia) END ASC NULLS LAST,
                CASE WHEN :sortBy = 'price_desc' THEN COALESCE(bt.gia_khuyen_mai, bt.gia) END DESC NULLS LAST,
                sp.ngay_tao DESC, bt.id DESC
            """,
            countQuery = """
            SELECT COUNT(*) FROM bien_the_san_pham bt
            JOIN san_pham sp ON bt.san_pham_id = sp.id
            WHERE bt.trang_thai IN ('CON_HANG','HET_HANG') AND sp.trang_thai = 'CON_HANG'
            AND (CAST(:phanLoaiId AS bigint) IS NULL OR sp.phan_loai_id = :phanLoaiId)
            AND (CAST(:search AS text) IS NULL OR LOWER(sp.ten_san_pham) LIKE :search)
            AND (CAST(:minPrice AS numeric) IS NULL OR COALESCE(bt.gia_khuyen_mai, bt.gia) >= :minPrice)
            AND (CAST(:maxPrice AS numeric) IS NULL OR COALESCE(bt.gia_khuyen_mai, bt.gia) <= :maxPrice)
            AND (:khuyenMai = 0 OR (bt.gia_khuyen_mai IS NOT NULL AND bt.gia_khuyen_mai < bt.gia))
            AND (CAST(:thongSo AS text) IS NULL
                 OR bt.thong_so_bien_the @> CAST(:thongSo AS jsonb))
            AND (CAST(:nhanMa AS text) IS NULL OR EXISTS (
                 SELECT 1 FROM bien_the_nhan bn JOIN nhan_san_pham n ON bn.nhan_id = n.id
                 WHERE bn.bien_the_id = bt.id AND n.ma_nhan = :nhanMa))
            """,
            nativeQuery = true)
    Page<BienTheSanPham> findBienTheCards(
            @Param("phanLoaiId") Long phanLoaiId,
            @Param("search") String search,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("khuyenMai") int khuyenMai,
            @Param("thongSo") String thongSo,
            @Param("nhanMa") String nhanMa,
            @Param("sortBy") String sortBy,
            Pageable pageable
    );

    // Chỉ fetch anhs, nhans sẽ lazy-load trong transaction
    @Query("""
            SELECT bt FROM BienTheSanPham bt
            LEFT JOIN FETCH bt.anhs
            WHERE bt.sanPham.id = :sanPhamId
            ORDER BY bt.gia
            """)
    List<BienTheSanPham> findBySanPhamIdWithDetails(@Param("sanPhamId") Long sanPhamId);

    // Nạp kèm sản phẩm cha để lấy snapshot (tên, slug, sanPhamId) không cần lazy-load thêm.
    @Query("""
            SELECT bt FROM BienTheSanPham bt
            JOIN FETCH bt.sanPham
            WHERE bt.id = :id
            """)
    Optional<BienTheSanPham> findByIdWithSanPham(@Param("id") Long id);

    // Atomic trừ kho: chỉ trừ khi đủ tồn. Trả số dòng cập nhật (1 = OK, 0 = không đủ kho).
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            UPDATE BienTheSanPham bt SET bt.soLuongTon = bt.soLuongTon - :soLuong
            WHERE bt.id = :id AND bt.soLuongTon >= :soLuong
            """)
    int truTonKho(@Param("id") Long id, @Param("soLuong") int soLuong);

    // Atomic hoàn kho khi hủy đơn.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE BienTheSanPham bt SET bt.soLuongTon = bt.soLuongTon + :soLuong WHERE bt.id = :id")
    int hoanTonKho(@Param("id") Long id, @Param("soLuong") int soLuong);

    // Đồng bộ trạng thái theo tồn: hết tồn → HET_HANG; có tồn lại → CON_HANG (không đụng biến thể NGUNG_BAN).
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE BienTheSanPham bt SET bt.trangThai = 'HET_HANG' WHERE bt.id = :id AND bt.soLuongTon <= 0 AND bt.trangThai = 'CON_HANG'")
    int danhDauHetHang(@Param("id") Long id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE BienTheSanPham bt SET bt.trangThai = 'CON_HANG' WHERE bt.id = :id AND bt.soLuongTon > 0 AND bt.trangThai = 'HET_HANG'")
    int danhDauConHang(@Param("id") Long id);

    // Đồng bộ snapshot tên SP + thương hiệu xuống mọi biến thể khi sản phẩm đổi tên/thương hiệu.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE BienTheSanPham bt SET bt.tenSanPham = :ten, bt.thuongHieu = :thuongHieu WHERE bt.sanPham.id = :sanPhamId")
    void dongBoTenThuongHieu(@Param("sanPhamId") Long sanPhamId,
                             @Param("ten") String ten,
                             @Param("thuongHieu") String thuongHieu);

    // Đồng bộ ảnh chính denormalized: = url ảnh có thu_tu = 0 của biến thể (null nếu không còn ảnh).
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            UPDATE bien_the_san_pham SET anh_bien_the_san_pham = (
                SELECT a.url_anh FROM anh_san_pham a
                WHERE a.bien_the_id = :bienTheId AND a.thu_tu = 0
                LIMIT 1)
            WHERE id = :bienTheId
            """, nativeQuery = true)
    int dongBoAnhBienThe(@Param("bienTheId") Long bienTheId);

    // Khi nhan_san_pham đổi → cập nhật lại value [ten_nhan, mau_sac, thu_tu_hien_thi, trang_thai]
    // trong bien_the_gan_nhan của MỌI biến thể đang gắn nhãn đó (key = nhan_id). Native vì thao tác JSONB.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            UPDATE bien_the_san_pham
            SET bien_the_gan_nhan = jsonb_set(
                    bien_the_gan_nhan,
                    ARRAY[CAST(:nhanId AS text)],
                    jsonb_build_array(CAST(:tenNhan AS text), CAST(:mauSac AS text),
                                      CAST(:thuTu AS int), CAST(:trangThai AS text)))
            WHERE jsonb_exists(bien_the_gan_nhan, CAST(:nhanId AS text))
            """, nativeQuery = true)
    int dongBoNhanVaoCacBienThe(@Param("nhanId") Long nhanId,
                                @Param("tenNhan") String tenNhan,
                                @Param("mauSac") String mauSac,
                                @Param("thuTu") Integer thuTu,
                                @Param("trangThai") String trangThai);

    // Admin: bỏ cờ "biến thể mặc định" ở mọi biến thể của sản phẩm (trước khi set 1 cái mới).
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE BienTheSanPham bt SET bt.laBienTheMacDinh = false WHERE bt.sanPham.id = :sanPhamId")
    void boMacDinhTatCa(@Param("sanPhamId") Long sanPhamId);

    // Đếm số biến thể của sản phẩm (xác định biến thể đầu tiên = mặc định).
    @Query("SELECT COUNT(bt) FROM BienTheSanPham bt WHERE bt.sanPham.id = :sanPhamId")
    int countBySanPhamId(@Param("sanPhamId") Long sanPhamId);

    // Atomic cập nhật cache field so_luot_ban của biến thể khi đơn hoàn thành.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE BienTheSanPham bt SET bt.soLuotBan = bt.soLuotBan + :soLuong WHERE bt.id = :id")
    int tangSoLuotBan(@Param("id") Long id, @Param("soLuong") int soLuong);

    // Lượt đánh giá theo biến thể: +1 khi có đánh giá mới, -1 khi xóa đánh giá.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE BienTheSanPham bt SET bt.soLuotDanhGia = bt.soLuotDanhGia + 1 WHERE bt.id = :id")
    int tangSoLuotDanhGia(@Param("id") Long id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE BienTheSanPham bt SET bt.soLuotDanhGia = bt.soLuotDanhGia - 1 WHERE bt.id = :id AND bt.soLuotDanhGia > 0")
    int giamSoLuotDanhGia(@Param("id") Long id);
}
