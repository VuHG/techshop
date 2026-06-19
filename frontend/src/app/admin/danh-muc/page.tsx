'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Eye, EyeOff, FolderPlus, FolderTree } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
  adminCategoryService,
  type DanhMucTree,
  type PhanLoaiNode,
} from '../_services/adminCategoryService';
import { PageHeader } from '../_components/PageHeader';
import { StatusBadge } from '../_components/StatusBadge';
import { ConfirmDialog } from '../_components/ConfirmDialog';
import { Modal } from '../_components/Modal';

const inp =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

type DanhMucForm = {
  id?: number;
  tenDanhMuc: string;
  slug: string;
  danhMucChaId: number | null;
  thuTuHienThi: string;
  trangThai: string;
};
type PhanLoaiForm = { id?: number; tenPhanLoai: string; danhMucId: number };
type DanhMucPhang = { id: number; ten: string; depth: number };

// Làm phẳng cây để chọn "danh mục cha" trong form (kèm độ sâu để thụt tên).
function lamPhang(cay: DanhMucTree[], depth = 0): DanhMucPhang[] {
  const out: DanhMucPhang[] = [];
  for (const dm of cay) {
    out.push({ id: dm.id, ten: dm.tenDanhMuc, depth });
    if (dm.danhMucCon?.length) out.push(...lamPhang(dm.danhMucCon, depth + 1));
  }
  return out;
}

interface Handlers {
  onToggle: (dm: DanhMucTree) => void;
  onEditCat: (dm: DanhMucTree) => void;
  onDeleteCat: (dm: DanhMucTree) => void;
  onAddPL: (dm: DanhMucTree) => void;
  onAddSub: (dm: DanhMucTree) => void;
  onEditPL: (dm: DanhMucTree, pl: PhanLoaiNode) => void;
  onDeletePL: (pl: PhanLoaiNode) => void;
}

export default function AdminDanhMucPage() {
  const qc = useQueryClient();
  const { data: cay, isLoading } = useQuery({
    queryKey: ['admin-danh-muc'],
    queryFn: () => adminCategoryService.getCay(),
  });

  const [formDM, setFormDM] = useState<DanhMucForm | null>(null);
  const [formPL, setFormPL] = useState<PhanLoaiForm | null>(null);
  const [xoaDM, setXoaDM] = useState<number | null>(null);
  const [xoaPL, setXoaPL] = useState<number | null>(null);

  const lamMoi = () => qc.invalidateQueries({ queryKey: ['admin-danh-muc'] });

  const toggle = useMutation({
    mutationFn: ({ id, tt }: { id: number; tt: string }) => adminCategoryService.doiTrangThai(id, tt),
    onSuccess: () => { toast.success('Đã cập nhật'); lamMoi(); },
  });
  const delDM = useMutation({
    mutationFn: (id: number) => adminCategoryService.xoaDanhMuc(id),
    onSuccess: () => { toast.success('Đã xóa danh mục'); setXoaDM(null); lamMoi(); },
  });
  const delPL = useMutation({
    mutationFn: (id: number) => adminCategoryService.xoaPhanLoai(id),
    onSuccess: () => { toast.success('Đã xóa phân loại'); setXoaPL(null); lamMoi(); },
  });

  const handlers: Handlers = {
    onToggle: (dm) => toggle.mutate({ id: dm.id, tt: dm.trangThai === 'AN' ? 'HIEN_THI' : 'AN' }),
    onEditCat: (dm) =>
      setFormDM({
        id: dm.id,
        tenDanhMuc: dm.tenDanhMuc,
        slug: dm.slug,
        danhMucChaId: dm.danhMucChaId,
        thuTuHienThi: String(dm.thuTuHienThi ?? 0),
        trangThai: dm.trangThai,
      }),
    onDeleteCat: (dm) => setXoaDM(dm.id),
    onAddPL: (dm) => setFormPL({ tenPhanLoai: '', danhMucId: dm.id }),
    onAddSub: (dm) =>
      setFormDM({ tenDanhMuc: '', slug: '', danhMucChaId: dm.id, thuTuHienThi: '0', trangThai: 'HIEN_THI' }),
    onEditPL: (dm, pl) => setFormPL({ id: pl.id, tenPhanLoai: pl.tenPhanLoai, danhMucId: dm.id }),
    onDeletePL: (pl) => setXoaPL(pl.id),
  };

  return (
    <div>
      <PageHeader
        title="Quản lý danh mục"
        subtitle="Danh mục (nhiều cấp) và phân loại sản phẩm"
        action={
          <button
            onClick={() =>
              setFormDM({ tenDanhMuc: '', slug: '', danhMucChaId: null, thuTuHienThi: '0', trangThai: 'HIEN_THI' })
            }
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> Thêm danh mục
          </button>
        }
      />

      {isLoading ? (
        <div className="py-20 text-center text-gray-400">Đang tải...</div>
      ) : (
        <div className="space-y-4">
          {(cay ?? []).map((dm) => (
            <DanhMucCard key={dm.id} dm={dm} depth={0} h={handlers} />
          ))}
          {cay?.length === 0 && (
            <p className="rounded-xl border border-gray-200 bg-white py-10 text-center text-gray-400">
              Chưa có danh mục nào
            </p>
          )}
        </div>
      )}

      {formDM && (
        <DanhMucModal
          form={formDM}
          danhMucs={lamPhang(cay ?? [])}
          onClose={() => setFormDM(null)}
          onSaved={() => { setFormDM(null); lamMoi(); }}
        />
      )}
      {formPL && <PhanLoaiModal form={formPL} onClose={() => setFormPL(null)} onSaved={() => { setFormPL(null); lamMoi(); }} />}

      <ConfirmDialog
        open={xoaDM != null}
        title="Xóa danh mục"
        message="Chỉ xóa được danh mục không còn phân loại và không còn danh mục con. Tiếp tục?"
        confirmLabel="Xóa"
        dangXuLy={delDM.isPending}
        onConfirm={() => xoaDM != null && delDM.mutate(xoaDM)}
        onClose={() => setXoaDM(null)}
      />
      <ConfirmDialog
        open={xoaPL != null}
        title="Xóa phân loại"
        message="Chỉ xóa được phân loại không còn sản phẩm. Tiếp tục?"
        confirmLabel="Xóa"
        dangXuLy={delPL.isPending}
        onConfirm={() => xoaPL != null && delPL.mutate(xoaPL)}
        onClose={() => setXoaPL(null)}
      />
    </div>
  );
}

function DanhMucCard({ dm, depth, h }: { dm: DanhMucTree; depth: number; h: Handlers }) {
  const an = dm.trangThai === 'AN';
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {depth > 0 && <span className="text-gray-300">↳</span>}
          <span className="font-semibold text-gray-900">{dm.tenDanhMuc}</span>
          <span className="text-xs text-gray-400">/{dm.slug}</span>
          <StatusBadge label={an ? 'Đã ẩn' : 'Hiển thị'} tone={an ? 'red' : 'green'} />
          {depth > 0 && (
            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-600">danh mục con</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <IconBtn title="Thêm danh mục con" onClick={() => h.onAddSub(dm)}><FolderTree className="h-4 w-4" /></IconBtn>
          <IconBtn title="Thêm phân loại" onClick={() => h.onAddPL(dm)}><FolderPlus className="h-4 w-4" /></IconBtn>
          <IconBtn title={an ? 'Hiện' : 'Ẩn'} onClick={() => h.onToggle(dm)}>
            {an ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </IconBtn>
          <IconBtn title="Sửa" onClick={() => h.onEditCat(dm)}><Pencil className="h-4 w-4" /></IconBtn>
          <IconBtn title="Xóa" danger onClick={() => h.onDeleteCat(dm)}><Trash2 className="h-4 w-4" /></IconBtn>
        </div>
      </div>

      {dm.phanLoais.length === 0 ? (
        <p className="px-5 py-3 text-sm text-gray-400">Chưa có phân loại</p>
      ) : (
        <ul className="divide-y divide-gray-50">
          {dm.phanLoais.map((pl) => (
            <li key={pl.id} className="flex items-center justify-between px-5 py-2.5 pl-8">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-800">{pl.tenPhanLoai}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {pl.soSanPham} sản phẩm
                </span>
              </div>
              <div className="flex items-center gap-1">
                <IconBtn title="Sửa" onClick={() => h.onEditPL(dm, pl)}><Pencil className="h-4 w-4" /></IconBtn>
                <IconBtn title="Xóa" danger onClick={() => h.onDeletePL(pl)}><Trash2 className="h-4 w-4" /></IconBtn>
              </div>
            </li>
          ))}
        </ul>
      )}

      {dm.danhMucCon?.length > 0 && (
        <div className="space-y-3 border-t border-gray-100 bg-gray-50/50 p-3 pl-6">
          {dm.danhMucCon.map((con) => (
            <DanhMucCard key={con.id} dm={con} depth={depth + 1} h={h} />
          ))}
        </div>
      )}
    </div>
  );
}

function DanhMucModal({
  form,
  danhMucs,
  onClose,
  onSaved,
}: {
  form: DanhMucForm;
  danhMucs: DanhMucPhang[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [f, setF] = useState(form);
  const [dangLuu, setDangLuu] = useState(false);
  const luu = async () => {
    if (!f.tenDanhMuc.trim()) return toast.error('Nhập tên danh mục');
    setDangLuu(true);
    try {
      const payload = {
        tenDanhMuc: f.tenDanhMuc.trim(),
        slug: f.slug.trim() || undefined,
        danhMucChaId: f.danhMucChaId,
        thuTuHienThi: Number(f.thuTuHienThi) || 0,
        trangThai: f.trangThai,
      };
      if (f.id) await adminCategoryService.capNhatDanhMuc(f.id, payload);
      else await adminCategoryService.taoDanhMuc(payload);
      toast.success('Đã lưu danh mục');
      onSaved();
    } catch { /* toasted */ } finally { setDangLuu(false); }
  };
  return (
    <Modal open title={f.id ? 'Sửa danh mục' : f.danhMucChaId ? 'Thêm danh mục con' : 'Thêm danh mục'} onClose={onClose}>
      <div className="space-y-3">
        <input className={inp} placeholder="Tên danh mục" value={f.tenDanhMuc} onChange={(e) => setF({ ...f, tenDanhMuc: e.target.value })} />
        <input className={inp} placeholder="Slug (để trống = tự sinh)" value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Danh mục cha</label>
          <select
            className={inp}
            value={f.danhMucChaId ?? ''}
            onChange={(e) => setF({ ...f, danhMucChaId: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">— Danh mục gốc —</option>
            {danhMucs.filter((d) => d.id !== f.id).map((d) => (
              <option key={d.id} value={d.id}>
                {'— '.repeat(d.depth)}{d.ten}
              </option>
            ))}
          </select>
        </div>
        <input className={inp} type="number" placeholder="Thứ tự hiển thị" value={f.thuTuHienThi} onChange={(e) => setF({ ...f, thuTuHienThi: e.target.value })} />
        <select className={inp} value={f.trangThai} onChange={(e) => setF({ ...f, trangThai: e.target.value })}>
          <option value="HIEN_THI">Hiển thị</option>
          <option value="AN">Ẩn</option>
        </select>
        <FormActions dangLuu={dangLuu} onClose={onClose} onLuu={luu} />
      </div>
    </Modal>
  );
}

function PhanLoaiModal({ form, onClose, onSaved }: { form: PhanLoaiForm; onClose: () => void; onSaved: () => void }) {
  const [ten, setTen] = useState(form.tenPhanLoai);
  const [dangLuu, setDangLuu] = useState(false);
  const luu = async () => {
    if (!ten.trim()) return toast.error('Nhập tên phân loại');
    setDangLuu(true);
    try {
      const payload = { tenPhanLoai: ten.trim(), danhMucId: form.danhMucId };
      if (form.id) await adminCategoryService.capNhatPhanLoai(form.id, payload);
      else await adminCategoryService.taoPhanLoai(payload);
      toast.success('Đã lưu phân loại');
      onSaved();
    } catch { /* toasted */ } finally { setDangLuu(false); }
  };
  return (
    <Modal open title={form.id ? 'Sửa phân loại' : 'Thêm phân loại'} onClose={onClose}>
      <div className="space-y-3">
        <input className={inp} placeholder="Tên phân loại" value={ten} onChange={(e) => setTen(e.target.value)} />
        <FormActions dangLuu={dangLuu} onClose={onClose} onLuu={luu} />
      </div>
    </Modal>
  );
}

function FormActions({ dangLuu, onClose, onLuu }: { dangLuu: boolean; onClose: () => void; onLuu: () => void }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button onClick={onClose} disabled={dangLuu} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60">
        Quay lại
      </button>
      <button onClick={onLuu} disabled={dangLuu} className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
        {dangLuu ? 'Đang lưu...' : 'Lưu'}
      </button>
    </div>
  );
}

function IconBtn({ children, title, danger, onClick }: { children: React.ReactNode; title: string; danger?: boolean; onClick: () => void }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        'rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-100',
        danger && 'hover:border-red-200 hover:bg-red-50 hover:text-red-600',
      )}
    >
      {children}
    </button>
  );
}
