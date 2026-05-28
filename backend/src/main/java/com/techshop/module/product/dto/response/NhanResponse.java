package com.techshop.module.product.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NhanResponse {
    private Long id;
    private String tenNhan;
    private String mauSac;
}
