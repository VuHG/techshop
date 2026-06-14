'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Pencil } from 'lucide-react';
import { profileService } from '@/services/profileService';
import { useAuthStore } from '@/stores/authStore';
import { AccountShell } from '@/components/account/AccountShell';
import { Input } from '@/components/ui/Input';
import { ProductImage } from '@/components/ui/ProductImage';
import { formatNgay } from '@/lib/utils';
import { capNhatProfileSchema, type CapNhatProfileForm } from '@/lib/validation';

export default function TaiKhoanPage() {
  return (
    <AccountShell>
      <TaiKhoanContent />
    </AccountShell>
  );
}

function TaiKhoanContent() {
  const setUser = useAuthStore((s) => s.setUser);
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: profileService.getProfile });
  const [dangSua, setDangSua] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CapNhatProfileForm>({ resolver: zodResolver(capNhatProfileSchema) });

  useEffect(() => {
    if (profile) {
      reset({ hoTen: profile.hoTen, email: profile.email ?? '', ngaySinh: profile.ngaySinh ?? '' });
      setAvatarUrl(profile.avatarUrl ?? '');
    }
  }, [profile, reset]);

  const onSubmit = async (data: CapNhatProfileForm) => {
    try {
      const p = await profileService.capNhatProfile({
        hoTen: data.hoTen,
        email: data.email || undefined,
        ngaySinh: data.ngaySinh || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      setUser(p);
      toast.success('Cập nhật hồ sơ thành công');
      setDangSua(false);
    } catch {
      /* interceptor toast */
    }
  };

  if (!profile) {
    return <div className="h-48 animate-pulse rounded-xl bg-gray-100" />;
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Tài khoản của tôi</h1>
        {!dangSua && (
          <button
            type="button"
            onClick={() => setDangSua(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary"
          >
            <Pencil className="h-4 w-4" /> Sửa
          </button>
        )}
      </div>

      {/* Ảnh đại diện */}
      <div className="mb-5 flex items-center gap-4">
        <ProductImage
          src={dangSua ? avatarUrl.trim() || null : profile.avatarUrl}
          alt={profile.hoTen}
          className="h-20 w-20 rounded-full border border-gray-200"
        />
        <div className="min-w-0">
          <p className="text-lg font-semibold text-gray-900">{profile.hoTen}</p>
          <p className="text-sm text-gray-500">{profile.soDienThoai}</p>
        </div>
      </div>

      {dangSua ? (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Ảnh đại diện (URL)</label>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <Input label="Họ và tên" error={errors.hoTen?.message} {...register('hoTen')} />
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Số điện thoại</label>
            <input
              value={profile.soDienThoai}
              readOnly
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              Số điện thoại là tài khoản đăng nhập, không thể thay đổi.
            </p>
          </div>
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Ngày sinh" type="date" error={errors.ngaySinh?.message} {...register('ngaySinh')} />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button
              type="button"
              onClick={() => { setDangSua(false); reset({ hoTen: profile.hoTen, email: profile.email ?? '', ngaySinh: profile.ngaySinh ?? '' }); setAvatarUrl(profile.avatarUrl ?? ''); }}
              className="rounded-lg border border-gray-300 px-6 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Hủy
            </button>
          </div>
        </form>
      ) : (
        // Chế độ XEM thông tin cá nhân.
        <dl className="max-w-lg divide-y divide-gray-100 text-sm">
          <ViewRow k="Họ và tên" v={profile.hoTen} />
          <ViewRow k="Số điện thoại" v={profile.soDienThoai} />
          <ViewRow k="Email" v={profile.email || '—'} />
          <ViewRow k="Ngày sinh" v={profile.ngaySinh ? formatNgay(profile.ngaySinh) : '—'} />
        </dl>
      )}
    </div>
  );
}

function ViewRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-gray-500">{k}</dt>
      <dd className="font-medium text-gray-800">{v}</dd>
    </div>
  );
}
