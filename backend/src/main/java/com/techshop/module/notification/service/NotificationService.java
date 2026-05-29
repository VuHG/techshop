package com.techshop.module.notification.service;

import com.techshop.module.notification.dto.response.ThongBaoResponse;
import com.techshop.shared.response.PageResponse;

/**
 * Cổng giao tiếp notification. taoThongBao là method cross-module (@Async ở impl)
 * cho Auth/Order gọi; các method còn lại phục vụ controller.
 */
public interface NotificationService {

    String LOAI_DON_HANG = "DON_HANG";
    String LOAI_KHUYEN_MAI = "KHUYEN_MAI";
    String LOAI_HE_THONG = "HE_THONG";

    /** Tạo thông báo bất đồng bộ. Lỗi chỉ log, không throw (side-effect). */
    void taoThongBao(Long nguoiDungId, String loai, String tieuDe, String noiDung, Long thamChieuId);

    PageResponse<ThongBaoResponse> getDanhSach(Long nguoiDungId, int page, int size);

    long demChuaDoc(Long nguoiDungId);

    void danhDauDaDoc(Long nguoiDungId, Long id);

    void danhDauTatCaDaDoc(Long nguoiDungId);
}
