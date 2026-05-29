package com.techshop.module.discount.service;

import com.techshop.module.discount.dto.KetQuaApDungMa;

import java.math.BigDecimal;
import java.util.List;

/**
 * Cổng giao tiếp của discount module. Order module dùng để kiểm tra mã khi checkout
 * và ghi nhận / hoàn trả lượt dùng.
 */
public interface MaGiamGiaService {

    /**
     * Kiểm tra mã hợp lệ với đơn hàng và tính số tiền giảm. KHÔNG thay đổi dữ liệu.
     * Ném DIS_001..DIS_006 nếu không hợp lệ.
     */
    KetQuaApDungMa kiemTraVaTinhGiam(String maCode, Long nguoiDungId,
                                     BigDecimal tongTienHang, List<Long> sanPhamIds);

    /** Ghi nhận đã dùng mã (atomic tăng lượt + lưu lịch sử). Ném DIS_002 nếu hết lượt. */
    void ghiNhanSuDung(Long maGiamGiaId, Long nguoiDungId, Long donHangId);

    /** Hoàn trả lượt dùng khi hủy đơn. */
    void hoanTraSuDung(Long maGiamGiaId, Long donHangId);
}
