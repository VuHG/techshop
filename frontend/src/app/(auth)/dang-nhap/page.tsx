'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { dangNhapSchema, type DangNhapForm } from '@/lib/validation';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { Input } from '@/components/ui/Input';
import { SocialButtons } from '@/components/auth/SocialButtons';

export default function DangNhapPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DangNhapForm>({ resolver: zodResolver(dangNhapSchema) });

  const onSubmit = async (data: DangNhapForm) => {
    try {
      const res = await authService.dangNhap(data.soDienThoai, data.matKhau);
      setAuth(res.nguoiDung, res.accessToken, res.refreshToken);
      toast.success('Đăng nhập thành công');
      router.push(res.nguoiDung.vaiTro === 'ADMIN' ? '/admin' : '/');
    } catch {
      // Lỗi đã được toast ở interceptor.
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-center text-2xl font-bold text-primary">ĐĂNG NHẬP</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Số điện thoại"
          placeholder="Nhập số điện thoại của bạn"
          error={errors.soDienThoai?.message}
          {...register('soDienThoai')}
        />
        <Input
          label="Mật khẩu"
          type="password"
          placeholder="Nhập mật khẩu của bạn"
          error={errors.matKhau?.message}
          {...register('matKhau')}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {isSubmitting ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link href="/quen-mat-khau" className="text-sm text-primary hover:underline">
          Quên mật khẩu ?
        </Link>
      </div>
      <p className="mt-2 text-center text-sm text-gray-600">
        Chưa có tài khoản?{' '}
        <Link href="/dang-ky" className="font-medium text-primary hover:underline">
          Đăng ký
        </Link>
      </p>

      <SocialButtons loai="dang-nhap" />
    </div>
  );
}
