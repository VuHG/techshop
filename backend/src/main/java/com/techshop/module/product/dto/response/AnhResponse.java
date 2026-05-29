package com.techshop.module.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnhResponse {
    private Long id;
    private String urlAnh;
    private boolean laAnhChinh;
    private Integer thuTu;
}
