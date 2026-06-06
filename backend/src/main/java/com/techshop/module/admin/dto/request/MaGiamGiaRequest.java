package com.techshop.module.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/** Thêm/sửa mã giảm giá. */
@Data
public class MaGiamGiaRequest {

    @NotBlank(message = "Mã code không được để trống")
    private String maCode;

    @NotBlank(message = "Tên chương trình không được để trống")
    private String tenMa;

    @NotBlank(message = "Loại giảm không được để trống")
    private String loaiGiam;          // PHAN_TRAM | SO_TIEN_CO_DINH

    @NotNull(message = "Giá trị giảm không được để trống")
    @Positive(message = "Giá trị giảm phải lớn hơn 0")
    private BigDecimal giaTriGiam;

    private BigDecimal giaTriGiamToiDa;

    private BigDecimal dieuKienToiThieu;

    @Positive(message = "Số lượng tối đa phải lớn hơn 0")
    private int soLuongToiDa;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private OffsetDateTime batDau;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    private OffsetDateTime ketThuc;

    private String trangThai;         // HOAT_DONG | VO_HIEU (mặc định HOAT_DONG)

    private List<Long> sanPhamIds;    // rỗng = áp dụng toàn đơn
}
