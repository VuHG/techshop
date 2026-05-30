'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { profileService } from '@/services/profileService';
import { useAuthStore } from '@/stores/authStore';
import { AccountShell } from '@/components/account/AccountShell';
import { Input } from '@/components/ui/Input';
import { capNhatProfileSchema, type CapNhatProfileForm } from '@/lib/validation';

export default function TaiKhoanPage() {
  return (
    <AccountShell>
      <TaiKhoanForm />
    </AccountShell>
  );
}

function TaiKhoanForm() {
  const setUser = useAuthStore((s) => s.setUser);
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: profileService.getProfile });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CapNhatProfileForm>({ resolver: zodResolver(capNhatProfileSchema) });

  useEffect(() => {
    if (profile) {
      reset({ hoTen: profile.hoTen, email: profile.email ?? '', ngaySinh: profile.ngaySinh ?? '' });
    }
  }, [profile, reset]);

  const onSubmit = async (data: CapNhatProfileForm) => {
    try {
      const p = await profileService.capNhatProfile({
        hoTen: data.hoTen,
        email: data.email || undefined,
        ngaySinh: data.ngaySinh || undefined,
      });
      setUser(p);
      toast.success('Cập nhật hồ sơ thành công');
    } catch {
      /* interceptor toast */
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <h1 className="mb-4 text-xl font-bold text-gray-800">Tài khoản của tôi</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4">
        <Input label="Họ và tên" error={errors.hoTen?.message} {...register('hoTen')} />
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Số điện thoại</label>
          <input
            value={profile?.soDienThoai ?? ''}
            readOnly
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Số điện thoại là tài khoản đăng nhập, không thể thay đổi.
          </p>
        </div>
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input label="Ngày sinh" type="date" error={errors.ngaySinh?.message} {...register('ngaySinh')} />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>
    </div>
  );
}
