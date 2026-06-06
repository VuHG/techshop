package com.techshop.module.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonHangSummaryResponse {
    private Long id;
    private String maDonHang;
    private String trangThai;
    private BigDecimal tongThanhToan;
    private int soLuongSanPham;     // tổng số lượng item trong đơn
    private String tenSanPhamDau;   // tên sản phẩm đầu tiên (hiển thị nhanh)
    private String anhDaiDien;      // ảnh sản phẩm đầu tiên
    private OffsetDateTime ngayTao;
    // Bổ sung cho danh sách admin (khách hàng không dùng nhưng vô hại).
    private String hoTenNguoiNhan;
    private String soDienThoaiNhan;
    private String phuongThucThanhToan;
}
