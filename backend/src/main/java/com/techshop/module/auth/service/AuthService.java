package com.techshop.module.auth.service;

import com.techshop.module.auth.dto.request.*;
import com.techshop.module.auth.dto.response.AuthResponse;
import com.techshop.module.auth.dto.response.NguoiDungResponse;
import com.techshop.module.auth.entity.MatKhauReset;
import com.techshop.module.auth.entity.NguoiDung;
import com.techshop.module.auth.entity.VaiTro;
import com.techshop.module.auth.repository.MatKhauResetRepository;
import com.techshop.module.auth.repository.NguoiDungRepository;
import com.techshop.module.auth.repository.VaiTroRepository;
import com.techshop.module.notification.service.NotificationService;
import com.techshop.shared.config.EmailService;
import com.techshop.shared.exception.AppException;
import com.techshop.shared.exception.ErrorCode;
import com.techshop.shared.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final NguoiDungRepository nguoiDungRepository;
    private final VaiTroRepository vaiTroRepository;
    private final MatKhauResetRepository matKhauResetRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final StringRedisTemplate redisTemplate;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Value("${app.otp.expiry-minutes}")
    private int otpExpiryMinutes;

    private static final String REDIS_REFRESH_KEY = "rt:";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // ===================== ĐĂNG KÝ =====================

    @Transactional
    public String dangKy(DangKyRequest req) {
        if (!req.getMatKhau().equals(req.getXacNhanMatKhau())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        if (nguoiDungRepository.existsBySoDienThoai(req.getSoDienThoai())) {
            throw new AppException(ErrorCode.AUTH_001);
        }
        if (req.getEmail() != null && !req.getEmail().isBlank()
                && nguoiDungRepository.existsByEmail(req.getEmail())) {
            throw new AppException(ErrorCode.AUTH_009);
        }

        VaiTro customerRole = vaiTroRepository.findByTenVaiTro("CUSTOMER")
                .orElseThrow(() -> new AppException(ErrorCode.INTERNAL_ERROR));

        String otp = taoOtp();
        NguoiDung nguoiDung = NguoiDung.builder()
                .hoTen(req.getHoTen())
                .soDienThoai(req.getSoDienThoai())
                .email(req.getEmail())
                .ngaySinh(req.getNgaySinh())
                .matKhau(passwordEncoder.encode(req.getMatKhau()))
                .vaiTro(customerRole)
                .trangThai("CHO_XAC_THUC")
                .otpXacThuc(otp)
                .otpHetHan(OffsetDateTime.now().plusMinutes(otpExpiryMinutes))
                .daXacThuc(false)
                .build();

        nguoiDungRepository.save(nguoiDung);

        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            emailService.sendOtpXacThucTaiKhoan(req.getEmail(), req.getHoTen(), otp);
        } else {
            log.info("[DEV] OTP đăng ký cho SĐT {}: {}", req.getSoDienThoai(), otp);
        }

        return "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP xác thực tài khoản.";
    }

    // ===================== XÁC THỰC OTP =====================

    @Transactional
    public AuthResponse xacThucOtp(XacThucOtpRequest req) {
        NguoiDung nd = timNguoiDungTheoSdt(req.getSoDienThoai());

        if (nd.isDaXacThuc()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        if (!req.getOtp().equals(nd.getOtpXacThuc())
                || nd.getOtpHetHan() == null
                || OffsetDateTime.now().isAfter(nd.getOtpHetHan())) {
            throw new AppException(ErrorCode.AUTH_004);
        }

        nd.setTrangThai("HOAT_DONG");
        nd.setDaXacThuc(true);
        nd.setOtpXacThuc(null);
        nd.setOtpHetHan(null);
        nguoiDungRepository.save(nd);

        notificationService.taoThongBao(nd.getId(), NotificationService.LOAI_HE_THONG,
                "Chào mừng đến TechShop",
                "Tài khoản của bạn đã được kích hoạt. Khám phá ngay các sản phẩm công nghệ mới nhất!",
                null);

        return taoAuthResponse(nd);
    }

    // ===================== GỬI LẠI OTP =====================

    @Transactional
    public String guiLaiOtp(GuiLaiOtpRequest req) {
        NguoiDung nd = timNguoiDungTheoSdt(req.getSoDienThoai());

        if (nd.isDaXacThuc()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        if (nd.getEmail() == null || nd.getEmail().isBlank()) {
            throw new AppException(ErrorCode.AUTH_007);
        }

        String otp = taoOtp();
        nd.setOtpXacThuc(otp);
        nd.setOtpHetHan(OffsetDateTime.now().plusMinutes(otpExpiryMinutes));
        nguoiDungRepository.save(nd);

        emailService.sendOtpXacThucTaiKhoan(nd.getEmail(), nd.getHoTen(), otp);
        return "Đã gửi lại mã OTP về email của bạn.";
    }

    // ===================== ĐĂNG NHẬP =====================

    @Transactional(readOnly = true)
    public AuthResponse dangNhap(DangNhapRequest req) {
        NguoiDung nd = nguoiDungRepository.findBySoDienThoai(req.getSoDienThoai())
                .orElseThrow(() -> new AppException(ErrorCode.AUTH_002));

        if (!passwordEncoder.matches(req.getMatKhau(), nd.getMatKhau())) {
            throw new AppException(ErrorCode.AUTH_002);
        }
        if ("BI_KHOA".equals(nd.getTrangThai())) {
            throw new AppException(ErrorCode.AUTH_003);
        }
        if (!nd.isDaXacThuc()) {
            throw new AppException(ErrorCode.AUTH_005);
        }

        return taoAuthResponse(nd);
    }

    // ===================== QUÊN MẬT KHẨU =====================

    @Transactional
    public String quenMatKhau(QuenMatKhauRequest req) {
        NguoiDung nd = timNguoiDungTheoSdt(req.getSoDienThoai());

        if (nd.getEmail() == null || nd.getEmail().isBlank()) {
            throw new AppException(ErrorCode.AUTH_007);
        }

        String otp = taoOtp();
        MatKhauReset reset = MatKhauReset.builder()
                .nguoiDung(nd)
                .otp(otp)
                .hetHan(OffsetDateTime.now().plusMinutes(otpExpiryMinutes))
                .daSuDung(false)
                .build();
        matKhauResetRepository.save(reset);

        emailService.sendOtpQuenMatKhau(nd.getEmail(), nd.getHoTen(), otp);
        return "Đã gửi mã OTP đặt lại mật khẩu về email của bạn.";
    }

    // ===================== ĐẶT LẠI MẬT KHẨU =====================

    @Transactional
    public String datLaiMatKhau(DatLaiMatKhauRequest req) {
        if (!req.getMatKhauMoi().equals(req.getXacNhanMatKhau())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }

        NguoiDung nd = timNguoiDungTheoSdt(req.getSoDienThoai());
        MatKhauReset reset = matKhauResetRepository
                .findTopByNguoiDungAndDaSuDungFalseOrderByNgayTaoDesc(nd)
                .orElseThrow(() -> new AppException(ErrorCode.AUTH_004));

        if (!req.getOtp().equals(reset.getOtp())
                || OffsetDateTime.now().isAfter(reset.getHetHan())) {
            throw new AppException(ErrorCode.AUTH_004);
        }

        nd.setMatKhau(passwordEncoder.encode(req.getMatKhauMoi()));
        nguoiDungRepository.save(nd);

        reset.setDaSuDung(true);
        matKhauResetRepository.save(reset);

        return "Đặt lại mật khẩu thành công. Vui lòng đăng nhập.";
    }

    // ===================== REFRESH TOKEN =====================

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(RefreshTokenRequest req) {
        String token = req.getRefreshToken();

        if (!jwtUtil.isValid(token) || !"REFRESH".equals(jwtUtil.getType(token))) {
            throw new AppException(ErrorCode.AUTH_006);
        }

        Long userId = jwtUtil.getUserId(token);
        String jti = jwtUtil.getJti(token);
        String storedJti = redisTemplate.opsForValue().get(REDIS_REFRESH_KEY + userId);

        if (!jti.equals(storedJti)) {
            throw new AppException(ErrorCode.AUTH_006);
        }

        NguoiDung nd = nguoiDungRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.AUTH_006));

        return taoAuthResponse(nd);
    }

    // ===================== ĐĂNG XUẤT =====================

    public void dangXuat(Long userId) {
        redisTemplate.delete(REDIS_REFRESH_KEY + userId);
    }

    // ===================== HELPER =====================

    private AuthResponse taoAuthResponse(NguoiDung nd) {
        String role = nd.getVaiTro().getTenVaiTro();
        String accessToken = jwtUtil.generateAccessToken(nd.getId(), role);
        String refreshToken = jwtUtil.generateRefreshToken(nd.getId(), role);

        String jti = jwtUtil.getJti(refreshToken);
        redisTemplate.opsForValue().set(
                REDIS_REFRESH_KEY + nd.getId(),
                jti,
                7, TimeUnit.DAYS
        );

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .nguoiDung(toNguoiDungResponse(nd))
                .build();
    }

    private NguoiDung timNguoiDungTheoSdt(String soDienThoai) {
        return nguoiDungRepository.findBySoDienThoai(soDienThoai)
                .orElseThrow(() -> new AppException(ErrorCode.AUTH_008));
    }

    private NguoiDungResponse toNguoiDungResponse(NguoiDung nd) {
        return NguoiDungResponse.builder()
                .id(nd.getId())
                .hoTen(nd.getHoTen())
                .soDienThoai(nd.getSoDienThoai())
                .email(nd.getEmail())
                .ngaySinh(nd.getNgaySinh())
                .vaiTro(nd.getVaiTro().getTenVaiTro())
                .build();
    }

    private String taoOtp() {
        return String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
    }
}
