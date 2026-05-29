package com.techshop.module.product.service;

import com.techshop.module.product.dto.BienTheInfo;

/**
 * Cổng giao tiếp cross-module của product module.
 * Cart/Order chỉ phụ thuộc interface này, không import @Entity của product.
 */
public interface ProductQueryService {

    /** Lấy thông tin biến thể. Ném PROD_002 nếu không tồn tại. */
    BienTheInfo layThongTinBienThe(Long bienTheId);

    /** Trừ kho atomic. Trả true nếu đủ kho và trừ thành công, false nếu không đủ. */
    boolean truTonKho(Long bienTheId, int soLuong);

    /** Hoàn kho atomic (khi hủy đơn). */
    void hoanTonKho(Long bienTheId, int soLuong);

    /** Tăng cache field so_luot_ban atomic khi đặt hàng thành công. */
    void tangSoLuotBan(Long sanPhamId, int soLuong);

    /**
     * Cập nhật cache điểm đánh giá khi có review mới (incremental, KHÔNG tính AVG lại toàn bộ):
     * tb_moi = (tb_cu * count + diem) / (count + 1); count += 1.
     */
    void capNhatDiemDanhGia(Long sanPhamId, int diem);
}
