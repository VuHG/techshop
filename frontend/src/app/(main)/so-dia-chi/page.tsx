'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { profileService } from '@/services/profileService';
import { AccountShell } from '@/components/account/AccountShell';
import { AddressForm } from '@/components/account/AddressForm';
import type { DiaChi } from '@/types';
import type { DiaChiForm } from '@/lib/validation';

export default function SoDiaChiPage() {
  return (
    <AccountShell>
      <SoDiaChiContent />
    </AccountShell>
  );
}

function SoDiaChiContent() {
  const qc = useQueryClient();
  const { data: list, isLoading } = useQuery({ queryKey: ['dia-chi'], queryFn: profileService.getDiaChi });

  const [moForm, setMoForm] = useState(false);
  const [editing, setEditing] = useState<DiaChi | null>(null);
  const [dangLuu, setDangLuu] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ['dia-chi'] });

  const luu = async (data: DiaChiForm) => {
    setDangLuu(true);
    try {
      if (editing) await profileService.capNhatDiaChi(editing.id, data);
      else await profileService.themDiaChi(data);
      toast.success(editing ? 'Đã cập nhật địa chỉ' : 'Đã thêm địa chỉ');
      setMoForm(false);
      setEditing(null);
      refresh();
    } catch {
      /* interceptor toast */
    } finally {
      setDangLuu(false);
    }
  };

  const xoa = async (id: number) => {
    if (!window.confirm('Xóa địa chỉ này?')) return;
    try {
      await profileService.xoaDiaChi(id);
      toast.success('Đã xóa địa chỉ');
      refresh();
    } catch {
      /* */
    }
  };

  const datMacDinh = async (id: number) => {
    try {
      await profileService.datMacDinh(id);
      toast.success('Đã đặt làm mặc định');
      refresh();
    } catch {
      /* */
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Sổ địa chỉ</h1>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setMoForm(true);
          }}
          className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> Thêm địa chỉ
        </button>
      </div>

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
      ) : !list || list.length === 0 ? (
        <p className="py-10 text-center text-gray-500">Chưa có địa chỉ nào.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((d) => (
            <li
              key={d.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 p-3"
            >
              <div className="text-sm">
                <p className="font-medium text-gray-800">
                  {d.hoTenNguoiNhan} · {d.soDienThoai}
                  {d.laMacDinh && (
                    <span className="ml-1 rounded bg-primary-100 px-1.5 py-0.5 text-[11px] text-primary">
                      Mặc định
                    </span>
                  )}
                </p>
                <p className="text-gray-600">{d.diaChiDayDu}</p>
              </div>
              <div className="flex shrink-0 gap-2 text-gray-500">
                {!d.laMacDinh && (
                  <button type="button" onClick={() => datMacDinh(d.id)} title="Đặt mặc định" className="hover:text-primary">
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditing(d);
                    setMoForm(true);
                  }}
                  title="Sửa"
                  className="hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => xoa(d.id)} title="Xóa" className="hover:text-sale">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {moForm && (
        <AddressForm
          initial={editing}
          dangLuu={dangLuu}
          onSubmit={luu}
          onClose={() => {
            setMoForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
