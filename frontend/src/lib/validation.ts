import { z } from 'zod';

// Regex SĐT khớp backend: ^(0[3|5|7|8|9])+([0-9]{8})$
const SDT_REGEX = /^(0[35789])([0-9]{8})$/;
const sdt = z
  .string()
  .min(1, 'Số điện thoại không được để trống')
  .regex(SDT_REGEX, 'Số điện thoại không hợp lệ');

// Mật khẩu: backend yêu cầu tối thiểu 8 ký tự.
const matKhau = z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự');
const otp = z.string().regex(/^[0-9]{6}$/, 'OTP phải là 6 chữ số');

export const dangNhapSchema = z.object({
  soDienThoai: sdt,
  matKhau: z.string().min(1, 'Mật khẩu không được để trống'),
});
export type DangNhapForm = z.infer<typeof dangNhapSchema>;

export const dangKySchema = z
  .object({
    hoTen: z.string().min(1, 'Họ tên không được để trống').max(100, 'Tối đa 100 ký tự'),
    soDienThoai: sdt,
    email: z.string().min(1, 'Email không được để trống').email('Email không hợp lệ'),
    ngaySinh: z.string().optional(),
    matKhau: matKhau,
    xacNhanMatKhau: z.string().min(1, 'Vui lòng nhập lại mật khẩu'),
    dongY: z.literal(true, { errorMap: () => ({ message: 'Bạn cần đồng ý điều khoản' }) }),
  })
  .refine((d) => d.matKhau === d.xacNhanMatKhau, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['xacNhanMatKhau'],
  });
export type DangKyForm = z.infer<typeof dangKySchema>;

export const otpSchema = z.object({ otp });
export type OtpForm = z.infer<typeof otpSchema>;

export const quenMatKhauSchema = z.object({ soDienThoai: sdt });
export type QuenMatKhauForm = z.infer<typeof quenMatKhauSchema>;

export const datLaiMatKhauSchema = z
  .object({
    otp,
    matKhauMoi: matKhau,
    xacNhanMatKhau: z.string().min(1, 'Vui lòng nhập lại mật khẩu'),
  })
  .refine((d) => d.matKhauMoi === d.xacNhanMatKhau, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['xacNhanMatKhau'],
  });
export type DatLaiMatKhauForm = z.infer<typeof datLaiMatKhauSchema>;

export const capNhatProfileSchema = z.object({
  hoTen: z.string().min(1, 'Họ tên không được để trống').max(100, 'Tối đa 100 ký tự'),
  email: z.union([z.string().email('Email không hợp lệ'), z.literal('')]).optional(),
  ngaySinh: z.string().optional(),
});
export type CapNhatProfileForm = z.infer<typeof capNhatProfileSchema>;

export const diaChiSchema = z.object({
  hoTenNguoiNhan: z.string().min(1, 'Vui lòng nhập họ tên người nhận'),
  soDienThoai: z.string().regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ'),
  diaChiChiTiet: z.string().min(1, 'Vui lòng nhập địa chỉ chi tiết'),
  phuongXa: z.string().min(1, 'Vui lòng nhập phường/xã'),
  quanHuyen: z.string().min(1, 'Vui lòng nhập quận/huyện'),
  tinhThanh: z.string().min(1, 'Vui lòng nhập tỉnh/thành'),
  laMacDinh: z.boolean(),
});
export type DiaChiForm = z.infer<typeof diaChiSchema>;
