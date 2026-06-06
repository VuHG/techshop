package com.techshop.module.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaGiamGiaResponse {
    private Long id;
    private String maCode;
    private String tenMa;
    private String loaiGiam;
    private BigDecimal giaTriGiam;
    private BigDecimal giaTriGiamToiDa;
    private BigDecimal dieuKienToiThieu;
    private int soLuongToiDa;
    private int soLuongDaDung;
    private OffsetDateTime batDau;
    private OffsetDateTime ketThuc;
    private String trangThai;
    private String tinhTrang;          // DANG_DIEN_RA | SAP_TOI | DA_KET_THUC | VO_HIEU (suy ra)

    // Chỉ có ở chi tiết.
    private List<Long> sanPhamIds;
    private List<LichSuItem> lichSu;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LichSuItem {
        private Long nguoiDungId;
        private Long donHangId;
        private OffsetDateTime ngayTao;
    }
}
