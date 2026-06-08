package com.techshop.module.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/** Một dòng trong danh sách sản phẩm (admin) — kèm danh sách biến thể để hiển thị lồng. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminSanPhamSummaryResponse {
    private Long id;
    private String tenSanPham;
    private String slug;
    private String thuongHieu;
    private Long phanLoaiId;
    private String tenPhanLoai;
    private String tenDanhMuc;
    private String anhChinh;
    private BigDecimal giaThap;
    private BigDecimal giaCao;
    private int tongTon;
    private int soBienThe;
    private String trangThai;
    private List<String> nhans;   // tên nhãn (gộp từ các biến thể)
    private List<BienTheDong> bienThes;

    /** Biến thể hiển thị trong bảng quản lý sản phẩm (lồng dưới sản phẩm). */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BienTheDong {
        private Long id;
        private String maBienThe;
        private String tenBienThe;
        private String mauSac;
        private int soLuotBan;
        private boolean laMacDinh;
        private Map<String, Object> thongSoBienThe;
        private BigDecimal gia;
        private BigDecimal giaKhuyenMai;
        private int soLuongTon;
        private String trangThai;
        private String anhChinh;
    }
}
