package com.techshop.shared.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.mail.dev-mode}")
    private boolean devMode;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Async("emailExecutor")
    public void sendOtpXacThucTaiKhoan(String toEmail, String hoTen, String otp) {
        String subject = "[TechShop] Mã xác thực tài khoản";
        String body = String.format(
                "Xin chào %s,\n\nMã xác thực tài khoản TechShop của bạn là:\n\n%s\n\nMã có hiệu lực trong 5 phút.\nVui lòng không chia sẻ mã này với bất kỳ ai.\n\nTrân trọng,\nTechShop",
                hoTen, otp
        );
        send(toEmail, subject, body);
    }

    @Async("emailExecutor")
    public void sendOtpQuenMatKhau(String toEmail, String hoTen, String otp) {
        String subject = "[TechShop] Mã đặt lại mật khẩu";
        String body = String.format(
                "Xin chào %s,\n\nMã đặt lại mật khẩu TechShop của bạn là:\n\n%s\n\nMã có hiệu lực trong 5 phút.\nNếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.\n\nTrân trọng,\nTechShop",
                hoTen, otp
        );
        send(toEmail, subject, body);
    }

    private void send(String to, String subject, String body) {
        // DEV mode: luôn in OTP ra console để tiện kiểm tra.
        if (devMode) {
            log.info("===== [DEV MODE - EMAIL] =====\nTo: {}\nSubject: {}\n{}\n==============================",
                    to, subject, body);
            // Chưa cấu hình SMTP (Gmail) → chỉ log, KHÔNG gửi.
            boolean coSmtp = mailUsername != null && !mailUsername.isBlank()
                    && !"apikey".equalsIgnoreCase(mailUsername.trim());
            if (!coSmtp) return;
            // Đã cấu hình Gmail → vừa log (ở trên) VỪA gửi thật (chạy tiếp xuống dưới).
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email đến {}: {}", to, e.getMessage());
        }
    }
}
