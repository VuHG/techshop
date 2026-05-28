package com.techshop.module.product.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DanhMucResponse {
    private Long id;
    private String tenDanhMuc;
    private String slug;
    private Integer thuTuHienThi;
    private List<DanhMucResponse> danhMucCon;
}
