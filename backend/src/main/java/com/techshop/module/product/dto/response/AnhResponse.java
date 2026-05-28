package com.techshop.module.product.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AnhResponse {
    private Long id;
    private String urlAnh;
    private boolean laAnhChinh;
    private Integer thuTu;
}
