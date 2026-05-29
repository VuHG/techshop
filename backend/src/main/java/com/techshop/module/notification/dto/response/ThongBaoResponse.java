package com.techshop.module.notification.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThongBaoResponse {
    private Long id;
    private String tieuDe;
    private String noiDung;
    private String loaiThongBao;
    private boolean daDoc;
    private Long thamChieuId;
    private OffsetDateTime ngayTao;
}
