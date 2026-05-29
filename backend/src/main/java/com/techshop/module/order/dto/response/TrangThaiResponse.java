package com.techshop.module.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrangThaiResponse {
    private String trangThai;
    private String ghiChu;
    private OffsetDateTime ngayTao;
}
