package com.techshop.module.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonHangResponse {
    private Long id;
    private String maDonHang;
    private String trangThai;
    private String hoTenNguoiNhan;
    private String soDienThoaiNhan;
    private String diaChiGiaoHang;
    private String phuongThucThanhToan;
    private BigDecimal tongTienHang;
    private BigDecimal tienGiamGia;
    private BigDecimal phiVanChuyen;
    private BigDecimal tongThanhToan;
    private String ghiChu;
    private String lyDoHuy;
    private boolean daHoanKho;
    private OffsetDateTime ngayTao;
    private List<ChiTietDonHangResponse> items;
    private List<TrangThaiResponse> lichSu;
}
