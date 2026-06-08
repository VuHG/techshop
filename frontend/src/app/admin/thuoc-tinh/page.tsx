'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminProductService } from '../_services/adminProductService';
import {
  adminAttributeService,
  type ThuocTinh,
  type ThuocTinhPayload,
} from '../_services/adminAttributeService';
import { PageHeader } from '../_components/PageHeader';
import { Modal } from '../_components/Modal';
import { ConfirmDialog } from '../_components/ConfirmDialog';

const inp =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

export default function AdminThuocTinhPage() {
  const qc = useQueryClient();
  const [danhMucId, setDanhMucId] = useState<number | ''>('');
  const [phanLoaiId, setPhanLoaiId] = useState<number | ''>('');
  const [moForm, setMoForm] = useState(false);
  const [editing, setEditing] = useState<ThuocTinh | null>(null);
  const [xoaId, setXoaId] = useState<number | null>(null);

  const { data: options } = useQuery({
    queryKey: ['admin-sp-options'],
    queryFn: () => adminProductService.getFormOptions(),
  });

  const { data: list, isLoading } = useQuery({
    queryKey: ['admin-thuoc-tinh', phanLoaiId],
    queryFn: () => adminAttributeService.getDanhSach(phanLoaiId as number),
    enabled: phanLoaiId !== '',
  });

  const lamMoi = () => qc.invalidateQueries({ queryKey: ['admin-thuoc-tinh', phanLoaiId] });

  // Danh mục duy nhất + phân loại theo danh mục đang chọn.
  const danhMucs = Array.from(
    new Map((options?.phanLoais ?? []).map((p) => [p.danhMucId, p.tenDanhMuc])).entries(),
  ).map(([id, ten]) => ({ id, ten }));
  const phanLoaisLoc = (options?.phanLoais ?? []).filter(
    (p) => danhMucId !== '' && p.danhMucId === danhMucId,
  );

  const xoa = useMutation({
    mutationFn: (id: number) => adminAttributeService.xoa(id),
    onSuccess: () => { toast.success('Đã xóa thuộc tính'); setXoaId(null); lamMoi(); },
  });

  return (
    <div>
      <PageHeader
        title="Quản lý thuộc tính"
        subtitle="Thông số kỹ thuật và giá trị của biến thể theo phân loại"
        action={
          <button
            disabled={phanLoaiId === ''}
            onClick={() => { setEditing(null); setMoForm(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Thêm thuộc tính
          </button>
        }
      />

      <div className="mb-5 grid max-w-2xl gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Bước 1 · Chọn danh mục</label>
          <select
            className={inp}
            value={danhMucId}
            onChange={(e) => {
              setDanhMucId(e.target.value ? Number(e.target.value) : '');
              setPhanLoaiId('');
            }}
          >
            <option value="">— Chọn danh mục —</option>
            {danhMucs.map((d) => (
              <option key={d.id} value={d.id}>{d.ten}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Bước 2 · Chọn phân loại</label>
          <select
            className={inp}
            value={phanLoaiId}
            disabled={danhMucId === ''}
            onChange={(e) => setPhanLoaiId(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">
              {danhMucId === '' ? '— Chọn danh mục trước —' : '— Chọn phân loại sản phẩm —'}
            </option>
            {phanLoaisLoc.map((p) => (
              <option key={p.id} value={p.id}>{p.tenPhanLoai}</option>
            ))}
          </select>
        </div>
      </div>

      {phanLoaiId === '' ? (
        <p className="rounded-xl border border-dashed border-gray-300 py-12 text-center text-gray-400">
          Chọn một phân loại để xem và quản lý thuộc tính
        </p>
      ) : isLoading ? (
        <div className="py-12 text-center text-gray-400">Đang tải...</div>
      ) : list && list.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((tt) => (
            <div key={tt.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{tt.tenThuocTinh}</p>
                  <p className="text-xs text-gray-400">khóa: {tt.maThuocTinh}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    title="Sửa"
                    onClick={() => { setEditing(tt); setMoForm(true); }}
                    className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    title="Xóa"
                    onClick={() => setXoaId(tt.id)}
                    className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tt.giaTris.length > 0 ? (
                  tt.giaTris.map((g) => (
                    <span key={g.id} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">
                      {g.giaTri}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">Chưa có giá trị</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-gray-200 bg-white py-12 text-center text-gray-400">
          Phân loại này chưa có thuộc tính nào
        </p>
      )}

      {moForm && phanLoaiId !== '' && (
        <ThuocTinhModal
          phanLoaiId={phanLoaiId}
          editing={editing}
          onClose={() => { setMoForm(false); setEditing(null); }}
          onSaved={() => { setMoForm(false); setEditing(null); lamMoi(); }}
        />
      )}

      <ConfirmDialog
        open={xoaId != null}
        title="Xóa thuộc tính"
        message="Thuộc tính và các giá trị sẽ bị ẩn khỏi bộ lọc. Tiếp tục?"
        confirmLabel="Xóa"
        dangXuLy={xoa.isPending}
        onConfirm={() => xoaId != null && xoa.mutate(xoaId)}
        onClose={() => setXoaId(null)}
      />
    </div>
  );
}

function ThuocTinhModal({
  phanLoaiId,
  editing,
  onClose,
  onSaved,
}: {
  phanLoaiId: number;
  editing: ThuocTinh | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [ten, setTen] = useState(editing?.tenThuocTinh ?? '');
  const [ma, setMa] = useState(editing?.maThuocTinh ?? '');
  const [giaTris, setGiaTris] = useState<string[]>(
    editing ? editing.giaTris.map((g) => g.giaTri) : [''],
  );
  const [dangLuu, setDangLuu] = useState(false);

  const suaGiaTri = (i: number, v: string) =>
    setGiaTris((arr) => arr.map((x, idx) => (idx === i ? v : x)));
  const xoaGiaTri = (i: number) => setGiaTris((arr) => arr.filter((_, idx) => idx !== i));

  const luu = async () => {
    if (!ten.trim()) return toast.error('Nhập tên thuộc tính');
    const vals = giaTris.map((s) => s.trim()).filter(Boolean);
    const payload: ThuocTinhPayload = {
      phanLoaiId,
      tenThuocTinh: ten.trim(),
      maThuocTinh: ma.trim() || undefined,
      giaTris: vals,
    };
    setDangLuu(true);
    try {
      if (editing) await adminAttributeService.capNhat(editing.id, payload);
      else await adminAttributeService.taoMoi(payload);
      toast.success(editing ? 'Đã cập nhật thuộc tính' : 'Đã thêm thuộc tính');
      onSaved();
    } catch { /* toasted */ } finally { setDangLuu(false); }
  };

  return (
    <Modal open title={editing ? 'Sửa thuộc tính' : 'Thêm thuộc tính'} onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tên thuộc tính *</label>
          <input className={inp} placeholder="VD: RAM, CPU, Màn hình" value={ten} onChange={(e) => setTen(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Khóa (để trống = tự sinh)</label>
          <input className={inp} placeholder="VD: ram, cpu, man_hinh" value={ma} onChange={(e) => setMa(e.target.value)} />
          <p className="mt-1 text-xs text-gray-400">Khóa phải khớp với thông số nhập ở biến thể sản phẩm để lọc đúng.</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Giá trị</label>
          <div className="space-y-2">
            {giaTris.map((g, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={inp}
                  placeholder="VD: 16GB"
                  value={g}
                  onChange={(e) => suaGiaTri(i, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => xoaGiaTri(i)}
                  className="shrink-0 rounded-lg border border-gray-300 px-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setGiaTris((a) => [...a, ''])}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              <Plus className="h-4 w-4" /> Thêm giá trị
            </button>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} disabled={dangLuu} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60">
            Quay lại
          </button>
          <button onClick={luu} disabled={dangLuu} className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
            {dangLuu ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
