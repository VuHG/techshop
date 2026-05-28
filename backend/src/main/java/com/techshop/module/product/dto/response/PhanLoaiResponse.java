package com.techshop.module.product.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PhanLoaiResponse {
    private Long id;
    private String tenPhanLoai;
    private Long danhMucId;
}
