package com.techshop.module.admin.dto.request;

import lombok.Data;

/** Lý do hủy đơn (tùy chọn) từ phía admin. */
@Data
public class HuyDonAdminRequest {
    private String lyDo;
}
