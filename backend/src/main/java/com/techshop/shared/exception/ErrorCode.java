package com.techshop.shared.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // Auth
    AUTH_001("AUTH_001", "Số điện thoại này đã được đăng ký", HttpStatus.CONFLICT),
    AUTH_002("AUTH_002", "Số điện thoại hoặc mật khẩu không đúng", HttpStatus.UNAUTHORIZED),
    AUTH_003("AUTH_003", "Tài khoản bị khóa, vui lòng liên hệ hỗ trợ", HttpStatus.FORBIDDEN),
    AUTH_004("AUTH_004", "OTP không đúng hoặc đã hết hạn", HttpStatus.BAD_REQUEST),
    AUTH_005("AUTH_005", "Tài khoản chưa được xác thực", HttpStatus.FORBIDDEN),
    AUTH_006("AUTH_006", "Token không hợp lệ hoặc đã hết hạn", HttpStatus.UNAUTHORIZED),
    AUTH_007("AUTH_007", "Tài khoản không có email để nhận OTP", HttpStatus.BAD_REQUEST),
    AUTH_008("AUTH_008", "Không tìm thấy tài khoản với số điện thoại này", HttpStatus.NOT_FOUND),

    // Product
    PROD_001("PROD_001", "Sản phẩm không tồn tại", HttpStatus.NOT_FOUND),
    PROD_002("PROD_002", "Biến thể sản phẩm không tồn tại", HttpStatus.NOT_FOUND),
    PROD_003("PROD_003", "Không thể so sánh sản phẩm khác phân loại", HttpStatus.BAD_REQUEST),
    PROD_004("PROD_004", "Biến thể đã hết hàng", HttpStatus.BAD_REQUEST),

    // Cart
    CART_001("CART_001", "Sản phẩm không đủ số lượng trong kho", HttpStatus.BAD_REQUEST),
    CART_002("CART_002", "Giỏ hàng trống", HttpStatus.BAD_REQUEST),
    CART_003("CART_003", "Sản phẩm không có trong giỏ hàng", HttpStatus.NOT_FOUND),

    // Order
    ORD_001("ORD_001", "Đơn hàng không tồn tại", HttpStatus.NOT_FOUND),
    ORD_002("ORD_002", "Không thể hủy đơn ở trạng thái này", HttpStatus.BAD_REQUEST),
    ORD_003("ORD_003", "Không thể xác nhận đơn ở trạng thái này", HttpStatus.BAD_REQUEST),

    // Discount
    DIS_001("DIS_001", "Mã giảm giá không tồn tại", HttpStatus.NOT_FOUND),
    DIS_002("DIS_002", "Mã giảm giá đã hết lượt sử dụng", HttpStatus.BAD_REQUEST),
    DIS_003("DIS_003", "Mã giảm giá chưa đến thời gian áp dụng hoặc đã hết hạn", HttpStatus.BAD_REQUEST),
    DIS_004("DIS_004", "Bạn đã sử dụng mã này trước đó", HttpStatus.BAD_REQUEST),
    DIS_005("DIS_005", "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này", HttpStatus.BAD_REQUEST),
    DIS_006("DIS_006", "Mã giảm giá không áp dụng cho sản phẩm trong giỏ", HttpStatus.BAD_REQUEST),

    // Review
    REV_001("REV_001", "Chỉ được đánh giá sau khi đơn hàng hoàn thành", HttpStatus.BAD_REQUEST),
    REV_002("REV_002", "Bạn đã đánh giá sản phẩm này", HttpStatus.CONFLICT),
    REV_003("REV_003", "Sản phẩm không thuộc đơn hàng này", HttpStatus.BAD_REQUEST),

    // Profile & Address
    PROFILE_001("PROFILE_001", "Email đã được sử dụng bởi tài khoản khác", HttpStatus.CONFLICT),
    ADDR_001("ADDR_001", "Địa chỉ không tồn tại", HttpStatus.NOT_FOUND),

    // Notification
    NOTI_001("NOTI_001", "Thông báo không tồn tại", HttpStatus.NOT_FOUND),

    // Common
    VALIDATION_ERROR("VALIDATION_ERROR", "Dữ liệu đầu vào không hợp lệ", HttpStatus.BAD_REQUEST),
    INTERNAL_ERROR("INTERNAL_ERROR", "Lỗi hệ thống, vui lòng thử lại sau", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(String code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
