package com.techshop.shared.config;

import com.techshop.module.auth.entity.NguoiDung;
import com.techshop.module.auth.entity.VaiTro;
import com.techshop.module.auth.repository.NguoiDungRepository;
import com.techshop.module.auth.repository.VaiTroRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Tạo tài khoản ADMIN mặc định khi khởi động nếu chưa tồn tại.
 * Dùng PasswordEncoder thật của ứng dụng để mật khẩu khớp khi đăng nhập
 * (tránh hardcode BCrypt hash trong migration SQL). Idempotent.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements ApplicationRunner {

    private final NguoiDungRepository nguoiDungRepository;
    private final VaiTroRepository vaiTroRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.phone}")
    private String adminPhone;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.full-name}")
    private String adminFullName;

    @Override
    public void run(ApplicationArguments args) {
        if (nguoiDungRepository.existsBySoDienThoai(adminPhone)) {
            return;
        }

        VaiTro adminRole = vaiTroRepository.findByTenVaiTro("ADMIN")
                .orElseThrow(() -> new IllegalStateException(
                        "Chưa có vai trò ADMIN — kiểm tra seed V5."));

        NguoiDung admin = NguoiDung.builder()
                .hoTen(adminFullName)
                .soDienThoai(adminPhone)
                .matKhau(passwordEncoder.encode(adminPassword))
                .vaiTro(adminRole)
                .trangThai("HOAT_DONG")
                .daXacThuc(true)
                .build();
        nguoiDungRepository.save(admin);

        log.info("Đã tạo tài khoản ADMIN mặc định (SĐT {}).", adminPhone);
    }
}
