import { api } from '@/lib/api';
import type { ApiResponse, AuthResult } from '@/types';

interface DangKyPayload {
  hoTen: string;
  soDienThoai: string;
  email?: string;
  ngaySinh?: string;
  matKhau: string;
  xacNhanMatKhau: string;
}

interface DatLaiMatKhauPayload {
  soDienThoai: string;
  otp: string;
  matKhauMoi: string;
  xacNhanMatKhau: string;
}

export const authService = {
  /** Đăng ký → trả message (backend gửi OTP qua email). */
  async dangKy(payload: DangKyPayload): Promise<string> {
    const res = await api.post<ApiResponse<string>>('/auth/dang-ky', payload);
    return res.data.data;
  },

  /** Xác thực OTP → đăng nhập luôn (trả token + người dùng). */
  async xacThucOtp(soDienThoai: string, otp: string): Promise<AuthResult> {
    const res = await api.post<ApiResponse<AuthResult>>('/auth/xac-thuc-otp', { soDienThoai, otp });
    return res.data.data;
  },

  async guiLaiOtp(soDienThoai: string): Promise<string> {
    const res = await api.post<ApiResponse<string>>('/auth/gui-lai-otp', { soDienThoai });
    return res.data.data;
  },

  async dangNhap(soDienThoai: string, matKhau: string): Promise<AuthResult> {
    const res = await api.post<ApiResponse<AuthResult>>('/auth/dang-nhap', { soDienThoai, matKhau });
    return res.data.data;
  },

  async quenMatKhau(soDienThoai: string): Promise<string> {
    const res = await api.post<ApiResponse<string>>('/auth/quen-mat-khau', { soDienThoai });
    return res.data.data;
  },

  async datLaiMatKhau(payload: DatLaiMatKhauPayload): Promise<string> {
    const res = await api.post<ApiResponse<string>>('/auth/dat-lai-mat-khau', payload);
    return res.data.data;
  },

  async dangXuat(): Promise<void> {
    await api.post('/auth/dang-xuat');
  },
};
