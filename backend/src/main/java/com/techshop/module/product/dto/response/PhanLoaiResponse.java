package com.techshop.module.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhanLoaiResponse {
    private Long id;
    private String tenPhanLoai;
    private Long danhMucId;
}
