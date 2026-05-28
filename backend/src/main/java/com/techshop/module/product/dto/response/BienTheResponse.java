package com.techshop.module.product.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Data
@Builder
public class BienTheResponse {
    private Long id;
    private String maBienThe;
    private Map<String, Object> thongSoBienThe;
    private BigDecimal gia;
    private BigDecimal giaKhuyenMai;
    private int soLuongTon;
    private String trangThai;
    private List<AnhResponse> anhs;
    private Set<NhanResponse> nhans;
}
