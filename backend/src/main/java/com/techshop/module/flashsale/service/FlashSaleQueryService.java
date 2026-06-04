package com.techshop.module.flashsale.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Cổng cross-module của flashsale. Cart/Order chỉ phụ thuộc interface này
 * để lấy giá flash sale (giá cuối khi mua) nếu biến thể đang trong flash sale còn hiệu lực.
 */
public interface FlashSaleQueryService {

    /** Trả giá flash sale còn hiệu lực của biến thể, rỗng nếu không có. */
    Optional<BigDecimal> giaFlashSaleConHieuLuc(Long bienTheId);

    /** Bản batch: map bienTheId → giá flash sale còn hiệu lực (chỉ chứa biến thể có flash). */
    Map<Long, BigDecimal> giaFlashSaleConHieuLuc(List<Long> bienTheIds);
}
