'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { dangKySchema, type DangKyForm } from '@/lib/validation';
import { authService } from '@/services/authService';
import { Input } from '@/components/ui/Input';
import { SocialButtons } from '@/components/auth/SocialButtons';

export default function DangKyPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DangKyForm>({ resolver: zodResolver(dangKySchema) });

  const onSubmit = async (data: DangKyForm) => {
    try {
      const msg = await authService.dangKy({
        hoTen: data.hoTen,
        soDienThoai: data.soDienThoai,
        email: data.email,
        ngaySinh: data.ngaySinh || undefined,
        matKhau: data.matKhau,
        xacNhanMatKhau: data.xacNhanMatKhau,
      });
      toast.success(msg || 'Đăng ký thành công, vui lòng xác thực OTP');
      router.push(`/xac-thuc-otp?sdt=${encodeURIComponent(data.soDienThoai)}`);
    } catch {
      // Lỗi đã toast ở interceptor.
    }
  };

  return (
    <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="mb-1 text-2xl font-bold text-primary">ĐĂNG KÝ</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-5">
        <div>
          <h2 className="mb-3 text-lg font-bold text-gray-800">Thông tin cá nhân</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Họ và tên"
              placeholder="Nhập họ và tên"
              error={errors.hoTen?.message}
              {...register('hoTen')}
            />
            <Input label="Ngày sinh" type="date" error={errors.ngaySinh?.message} {...register('ngaySinh')} />
            <Input
              label="Số điện thoại"
              placeholder="0908134120"
              error={errors.soDienThoai?.message}
              {...register('soDienThoai')}
            />
            <div>
              <Input
                label="Email"
                placeholder="email@gmail.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <p className="mt-1 text-xs text-green-600">
                Mã OTP xác thực tài khoản và hóa đơn VAT sẽ được gửi qua email này
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-bold text-gray-800">Tạo mật khẩu</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu của bạn"
              error={errors.matKhau?.message}
              {...register('matKhau')}
            />
            <Input
              label="Nhập lại mật khẩu"
              type="password"
              placeholder="Nhập lại mật khẩu của bạn"
              error={errors.xacNhanMatKhau?.message}
              {...register('xacNhanMatKhau')}
            />
          </div>
          <p className="mt-1 text-xs text-green-600">Mật khẩu tối thiểu 8 ký tự</p>
        </div>

        <div>
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input type="checkbox" className="mt-0.5 h-4 w-4" {...register('dongY')} />
            <span>
              Tôi đồng ý với{' '}
              <span className="font-medium text-primary">điều khoản sử dụng</span> và{' '}
              <span className="font-medium text-primary">chính sách bảo mật</span> của TechShop
            </span>
          </label>
          {errors.dongY && <p className="mt-1 text-xs text-sale">{errors.dongY.message}</p>}
        </div>

        <SocialButtons loai="dang-ky" />

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {isSubmitting ? 'Đang xử lý...' : 'ĐĂNG KÝ'}
          </button>
          <Link href="/dang-nhap" className="text-sm text-gray-500 hover:text-primary">
            Quay lại
          </Link>
        </div>
      </form>
    </div>
  );
}
