'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  quenMatKhauSchema,
  type QuenMatKhauForm,
  datLaiMatKhauSchema,
  type DatLaiMatKhauForm,
} from '@/lib/validation';
import { authService } from '@/services/authService';
import { Input } from '@/components/ui/Input';
import { OtpInput } from '@/components/ui/OtpInput';

export default function QuenMatKhauPage() {
  const router = useRouter();
  const [buoc, setBuoc] = useState<1 | 2>(1);
  const [sdt, setSdt] = useState('');

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="mb-1 text-center text-2xl font-bold text-primary">QUÊN MẬT KHẨU</h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        {buoc === 1 ? 'Nhập số điện thoại để nhận mã OTP qua email' : `Nhập OTP gửi tới email của SĐT ${sdt}`}
      </p>

      {buoc === 1 ? (
        <BuocNhapSdt
          onXong={(soDienThoai) => {
            setSdt(soDienThoai);
            setBuoc(2);
          }}
        />
      ) : (
        <BuocDatLai
          soDienThoai={sdt}
          onXong={() => {
            toast.success('Đặt lại mật khẩu thành công, mời đăng nhập');
            router.push('/dang-nhap');
          }}
        />
      )}

      <p className="mt-4 text-center text-sm text-gray-600">
        <Link href="/dang-nhap" className="font-medium text-primary hover:underline">
          Quay lại đăng nhập
        </Link>
      </p>
    </div>
  );
}

function BuocNhapSdt({ onXong }: { onXong: (sdt: string) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuenMatKhauForm>({ resolver: zodResolver(quenMatKhauSchema) });

  const onSubmit = async (data: QuenMatKhauForm) => {
    try {
      await authService.quenMatKhau(data.soDienThoai);
      toast.success('Đã gửi mã OTP qua email');
      onXong(data.soDienThoai);
    } catch {
      /* interceptor toast */
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Số điện thoại"
        placeholder="Nhập số điện thoại của bạn"
        error={errors.soDienThoai?.message}
        {...register('soDienThoai')}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
      >
        {isSubmitting ? 'Đang gửi...' : 'Gửi mã OTP'}
      </button>
    </form>
  );
}

function BuocDatLai({ soDienThoai, onXong }: { soDienThoai: string; onXong: () => void }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DatLaiMatKhauForm>({ resolver: zodResolver(datLaiMatKhauSchema) });

  const onSubmit = async (data: DatLaiMatKhauForm) => {
    try {
      await authService.datLaiMatKhau({ soDienThoai, ...data });
      onXong();
    } catch {
      /* interceptor toast */
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <span className="mb-1 block text-sm font-semibold text-gray-700">Mã OTP</span>
        <Controller
          control={control}
          name="otp"
          defaultValue=""
          render={({ field }) => (
            <OtpInput value={field.value} onChange={field.onChange} error={!!errors.otp} />
          )}
        />
        {errors.otp && <p className="mt-1 text-center text-xs text-sale">{errors.otp.message}</p>}
      </div>
      <Input
        label="Mật khẩu mới"
        type="password"
        placeholder="Nhập mật khẩu mới"
        error={errors.matKhauMoi?.message}
        {...register('matKhauMoi')}
      />
      <Input
        label="Nhập lại mật khẩu"
        type="password"
        placeholder="Nhập lại mật khẩu mới"
        error={errors.xacNhanMatKhau?.message}
        {...register('xacNhanMatKhau')}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
      >
        {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
      </button>
    </form>
  );
}
