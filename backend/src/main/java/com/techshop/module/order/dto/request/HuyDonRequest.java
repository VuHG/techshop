package com.techshop.module.order.dto.request;

import lombok.Data;

/** Khách hủy đơn kèm lý do (tùy chọn). */
@Data
public class HuyDonRequest {
    private String lyDo;
}
