package com.techshop.module.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminBienTheResponse {
    private Long id;
    private String maBienThe;
    private String tenSanPham;    // lấy trực tiếp từ sản phẩm (admin không nhập ở biến thể)
    private String thuongHieu;    // lấy trực tiếp từ sản phẩm
    private String tenBienThe;
    private String mauSac;
    private int soLuotBan;
    private boolean laMacDinh;
    private Map<String, Object> thongSoBienThe;
    private BigDecimal gia;
    private BigDecimal giaKhuyenMai;
    private int soLuongTon;
    private String trangThai;
    private List<String> anhUrls;
    private List<Long> nhanIds;
    private List<String> nhanTens;   // tên nhãn (để hiển thị ở màn xem chi tiết)
}
