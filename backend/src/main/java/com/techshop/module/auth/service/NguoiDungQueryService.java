package com.techshop.module.auth.service;

import com.techshop.module.auth.dto.NguoiDungInfo;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Cổng giao tiếp của auth module cho việc đọc/cập nhật thông tin tài khoản.
 * Profile module dùng interface này thay vì truy cập trực tiếp entity NguoiDung.
 */
public interface NguoiDungQueryService {

    NguoiDungInfo layThongTin(Long nguoiDungId);

    /** Lấy thông tin nhiều tài khoản 1 lần (tránh N+1) — trả map id → info. */
    Map<Long, NguoiDungInfo> layThongTinNhieu(List<Long> nguoiDungIds);

    /** Cập nhật hồ sơ. SĐT là khóa đăng nhập nên KHÔNG cho đổi ở MVP. */
    NguoiDungInfo capNhatThongTin(Long nguoiDungId, String hoTen, String email, LocalDate ngaySinh, String avatarUrl);
}
