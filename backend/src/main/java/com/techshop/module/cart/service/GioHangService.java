package com.techshop.module.cart.service;

import com.techshop.module.cart.dto.request.CapNhatSoLuongRequest;
import com.techshop.module.cart.dto.request.ThemGioHangRequest;
import com.techshop.module.cart.dto.response.GioHangItemResponse;
import com.techshop.module.cart.dto.response.GioHangResponse;

import java.util.List;

/**
 * Vừa là service cho cart controller, vừa là cổng cross-module cho order module
 * (order cần đọc item đã chọn và xóa chúng sau khi đặt hàng).
 */
public interface GioHangService {

    // ── Customer-facing ──────────────────────────────────────────────
    GioHangResponse getGioHang(Long nguoiDungId);

    GioHangResponse themVaoGio(Long nguoiDungId, ThemGioHangRequest req);

    GioHangResponse capNhatSoLuong(Long nguoiDungId, Long itemId, CapNhatSoLuongRequest req);

    GioHangResponse xoaItem(Long nguoiDungId, Long itemId);

    GioHangResponse xoaTatCa(Long nguoiDungId);

    // ── Cross-module (order) ─────────────────────────────────────────
    /** Lấy các item đã chọn (đã enrich thông tin sản phẩm) để checkout. */
    List<GioHangItemResponse> layItemDaChon(Long nguoiDungId, List<Long> itemIds);

    /** Xóa các item khỏi giỏ sau khi đặt hàng thành công. */
    void xoaItems(Long nguoiDungId, List<Long> itemIds);
}
