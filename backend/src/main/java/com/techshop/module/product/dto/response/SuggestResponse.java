package com.techshop.module.product.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SuggestResponse {
    private Long id;
    private String slug;
    private String tenSanPham;
    private String anhChinh;
    private BigDecimal giaThap;
}
