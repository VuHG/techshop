package com.techshop.module.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BienTheResponse {
    private Long id;
    private String maBienThe;
    private String tenBienThe;
    private String mauSac;
    private Map<String, Object> thongSoBienThe;
    private BigDecimal gia;
    private BigDecimal giaKhuyenMai;
    private int soLuongTon;
    private String trangThai;
    private List<AnhResponse> anhs;
    private Set<NhanResponse> nhans;
}
