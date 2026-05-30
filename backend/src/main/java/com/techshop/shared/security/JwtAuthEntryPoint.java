package com.techshop.shared.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.techshop.shared.exception.ErrorCode;
import com.techshop.shared.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Trả 401 + body JSON ApiResponse khi request chưa xác thực (thiếu/sai/hết hạn JWT),
 * thay cho mặc định 403 body rỗng của Spring Security. Nhờ vậy frontend nhận đúng 401
 * và tự refresh token.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(
                response.getWriter(),
                ApiResponse.error(ErrorCode.AUTH_006.getCode(), ErrorCode.AUTH_006.getMessage()));
    }
}
