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
    private Map<String, Object> thongSoBienThe;
    private BigDecimal gia;
    private BigDecimal giaKhuyenMai;
    private int soLuongTon;
    private String trangThai;
    private List<String> anhUrls;
    private List<Long> nhanIds;
}
