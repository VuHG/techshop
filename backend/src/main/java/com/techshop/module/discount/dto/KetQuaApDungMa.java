package com.techshop.module.discount.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

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
    private String loaiGiam;
    private BigDecimal tienGiam;          // số tiền được giảm
    private BigDecimal tongThanhToanSauGiam; // tongTienHang - tienGiam (chưa gồm phí ship)
}
