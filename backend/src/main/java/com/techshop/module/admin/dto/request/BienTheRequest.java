package com.techshop.module.admin.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/** Một biến thể trong form thêm/sửa sản phẩm. */
@Data
public class BienTheRequest {

    private Long id;                       // null = biến thể mới

    private String maBienThe;              // SKU (tùy chọn)

    private Map<String, Object> thongSoBienThe;  // {"ram":"16GB","color":"Đen"}

    @NotNull(message = "Giá biến thể không được để trống")
    @PositiveOrZero(message = "Giá không hợp lệ")
    private BigDecimal gia;

    private BigDecimal giaKhuyenMai;       // null = không khuyến mãi

    @PositiveOrZero(message = "Số lượng tồn không hợp lệ")
    private int soLuongTon;

    private String trangThai;              // CON_HANG | HET_HANG | NGUNG_BAN (mặc định CON_HANG)

    private List<String> anhUrls;          // URL ảnh của biến thể (ảnh đầu = ảnh chính)

    private List<Long> nhanIds;            // nhãn gắn cho biến thể
}
