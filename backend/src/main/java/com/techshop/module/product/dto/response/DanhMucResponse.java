package com.techshop.module.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DanhMucResponse {
    private Long id;
    private String tenDanhMuc;
    private String slug;
    private Integer thuTuHienThi;
    private List<DanhMucResponse> danhMucCon;
}
