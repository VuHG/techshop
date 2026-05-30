'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { diaChiSchema, type DiaChiForm } from '@/lib/validation';
import type { DiaChi } from '@/types';

interface AddressFormProps {
  initial?: DiaChi | null;
  dangLuu: boolean;
  onSubmit: (data: DiaChiForm) => void;
  onClose: () => void;
}

export function AddressForm({ initial, dangLuu, onSubmit, onClose }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DiaChiForm>({
    resolver: zodResolver(diaChiSchema),
    defaultValues: initial
      ? {
          hoTenNguoiNhan: initial.hoTenNguoiNhan,
          soDienThoai: initial.soDienThoai,
          diaChiChiTiet: initial.diaChiChiTiet,
          phuongXa: initial.phuongXa,
          quanHuyen: initial.quanHuyen,
          tinhThanh: initial.tinhThanh,
          laMacDinh: initial.laMacDinh,
        }
      : {
          hoTenNguoiNhan: '',
          soDienThoai: '',
          diaChiChiTiet: '',
          phuongXa: '',
          quanHuyen: '',
          tinhThanh: '',
          laMacDinh: false,
        },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">{initial ? 'Sửa địa chỉ' : 'Thêm địa chỉ'}</h3>
          <button type="button" aria-label="Đóng" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Họ tên người nhận" error={errors.hoTenNguoiNhan?.message} {...register('hoTenNguoiNhan')} />
            <Input label="Số điện thoại" placeholder="0xxxxxxxxx" error={errors.soDienThoai?.message} {...register('soDienThoai')} />
            <Input label="Tỉnh/Thành" error={errors.tinhThanh?.message} {...register('tinhThanh')} />
            <Input label="Quận/Huyện" error={errors.quanHuyen?.message} {...register('quanHuyen')} />
            <Input label="Phường/Xã" error={errors.phuongXa?.message} {...register('phuongXa')} />
          </div>
          <Input
            label="Địa chỉ chi tiết (số nhà, đường)"
            error={errors.diaChiChiTiet?.message}
            {...register('diaChiChiTiet')}
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" {...register('laMacDinh')} /> Đặt làm địa chỉ mặc định
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={dangLuu}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {dangLuu ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
