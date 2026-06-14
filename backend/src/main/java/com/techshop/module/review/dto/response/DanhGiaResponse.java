package com.techshop.module.review.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DanhGiaResponse {
    private Long id;
    private Long sanPhamId;
    private String slug;          // để điều hướng sang trang sản phẩm
    private String tenSanPham;
    private String anhSanPham;
    private Long donHangId;
    private int diem;
    private String noiDung;
    private OffsetDateTime ngayTao;
    private List<MediaItem> media;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MediaItem {
        private String urlMedia;
        private String loaiMedia;   // HINH_ANH | VIDEO
    }
}
