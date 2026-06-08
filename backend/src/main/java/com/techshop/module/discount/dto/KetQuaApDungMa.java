package com.techshop.module.discount.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Kết quả kiểm tra & tính giảm cho 1 mã. Dùng chung cho endpoint xem trước
 * và cho order module khi checkout.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KetQuaApDungMa {
    private Long maGiamGiaId;
    private String maCode;
    private String tenMa;
    private String loaiGiam;              // PHAN_TRAM | SO_TIEN_CO_DINH (cách tính)
    private String loaiApDung;            // DON_HANG (trừ tổng đơn) | SAN_PHAM (trừ vào sản phẩm)
    private BigDecimal tienGiam;          // tổng số tiền được giảm
    private BigDecimal tongThanhToanSauGiam; // tongTienHang - tienGiam (chưa gồm phí ship)
    // Mã áp dụng cho sản phẩm: tiền giảm phân bổ theo từng biến thể (bienTheId → tiền giảm).
    // Mã áp dụng cho đơn hàng: rỗng (giảm thẳng tổng đơn).
    private Map<Long, BigDecimal> giamTheoBienThe;
}
