package com.techshop.module.order.service;

/**
 * Cổng giao tiếp của order module cho các module khác (review).
 */
public interface OrderQueryService {

    /**
     * Đơn có thuộc về user, đã HOAN_THANH, và chứa biến thể này không?
     * Dùng để xác thực quyền đánh giá sản phẩm.
     */
    boolean kiemTraDonChoDanhGia(Long donHangId, Long nguoiDungId, Long bienTheId);
}
