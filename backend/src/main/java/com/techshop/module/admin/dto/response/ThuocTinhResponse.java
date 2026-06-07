package com.techshop.module.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThuocTinhResponse {
    private Long id;
    private String tenThuocTinh;
    private String maThuocTinh;
    private String kieuDuLieu;
    private Integer thuTuHienThi;
    private List<GiaTriItem> giaTris;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GiaTriItem {
        private Long id;
        private String giaTri;
    }
}
