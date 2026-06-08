'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Search, Plus, Pencil, Eye, EyeOff, Trash2, Info, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice, cn } from '@/lib/utils';
import { ProductImage } from '@/components/ui/ProductImage';
import {
  adminProductService,
  type BienTheDong,
} from '../_services/adminProductService';
import { PRODUCT_TABS, nhanTrangThaiSp, nhanTrangThaiBienThe } from '../_lib/productStatus';
import { PageHeader } from '../_components/PageHeader';
import { StatusBadge } from '../_components/StatusBadge';
import { AdminPagination } from '../_components/AdminPagination';
import { ConfirmDialog } from '../_components/ConfirmDialog';
import { SanPhamFormModal } from './SanPhamFormModal';
import { ProductDetailModal } from './ProductDetailModal';
import { ThemBienTheModal } from './ThemBienTheModal';

// Lưới dùng chung cho thanh tiêu đề, header sản phẩm và hàng biến thể (để thẳng cột).
// Cột thao tác cố định 216px (đủ 5 nút) để cụm nút luôn thẳng hàng.
const GRID =
  'grid grid-cols-[minmax(0,2.4fr)_1.3fr_1.4fr_0.6fr_1fr_216px] items-center gap-3';

export default function AdminSanPhamPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);

  const [moForm, setMoForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [xoaId, setXoaId] = useState<number | null>(null);
  // Thao tác biến thể
  const [viewBienThe, setViewBienThe] = useState<{ sanPhamId: number; bienTheId: number } | null>(null);
  const [bienTheForm, setBienTheForm] = useState<{
    sanPhamId: number;
    phanLoaiId: number;
    tenSanPham: string;
    editing: BienTheDong | null;
  } | null>(null);
  const [xoaBienTheId, setXoaBienTheId] = useState<number | null>(null);

  const { data: options } = useQuery({
    queryKey: ['admin-sp-options'],
    queryFn: () => adminProductService.getFormOptions(),
  });
  const { data: counts } = useQuery({
    queryKey: ['admin-sp-counts'],
    queryFn: () => adminProductService.demTrangThai(),
  });
  const { data, isLoading } = useQuery({
    queryKey: ['admin-sp', tab, search, page],
    queryFn: () => adminProductService.getDanhSach(tab, search, page, 20),
    placeholderData: keepPreviousData,
  });
  const { data: editing } = useQuery({
    queryKey: ['admin-sp-detail', editingId],
    queryFn: () => adminProductService.getChiTiet(editingId as number),
    enabled: editingId != null,
  });

  const lamMoi = () => {
    qc.invalidateQueries({ queryKey: ['admin-sp'] });
    qc.invalidateQueries({ queryKey: ['admin-sp-counts'] });
  };

  const doiTrangThai = useMutation({
    mutationFn: ({ id, tt }: { id: number; tt: string }) => adminProductService.doiTrangThai(id, tt),
    onSuccess: () => { toast.success('Đã cập nhật trạng thái'); lamMoi(); },
  });
  const xoa = useMutation({
    mutationFn: (id: number) => adminProductService.xoa(id),
    onSuccess: () => { toast.success('Đã xóa sản phẩm'); setXoaId(null); lamMoi(); },
  });
  const toggleBienThe = useMutation({
    mutationFn: ({ id, tt }: { id: number; tt: string }) =>
      adminProductService.doiTrangThaiBienThe(id, tt),
    onSuccess: () => { toast.success('Đã cập nhật biến thể'); lamMoi(); },
  });
  const xoaBT = useMutation({
    mutationFn: (id: number) => adminProductService.xoaBienThe(id),
    onSuccess: () => { toast.success('Đã xóa biến thể'); setXoaBienTheId(null); lamMoi(); },
  });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(0);
  };
  const dongForm = () => { setMoForm(false); setEditingId(null); };

  return (
    <div>
      <PageHeader
        title="Quản lý sản phẩm"
        subtitle="Mỗi sản phẩm là một cụm gồm các biến thể bên dưới"
        action={
          <button
            onClick={() => { setEditingId(null); setMoForm(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> Thêm sản phẩm
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {PRODUCT_TABS.map((t) => {
          const active = tab === t.value;
          const count = t.value ? counts?.[t.value] : undefined;
          return (
            <button
              key={t.value}
              onClick={() => { setTab(t.value); setPage(0); }}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition',
                active
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100',
              )}
            >
              {t.label}
              {count != null && count > 0 && (
                <span className={cn('ml-1.5', active ? 'text-white/80' : 'text-gray-400')}>({count})</span>
              )}
            </button>
          );
        })}
      </div>

      <form onSubmit={onSearch} className="mb-4 flex gap-2">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên sản phẩm..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
          Tìm
        </button>
      </form>

      {/* Bảng cụm sản phẩm → biến thể */}
      <div className="overflow-x-auto">
        <div className="min-w-[920px]">
          <div className={cn(GRID, 'px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500')}>
            <span>Sản phẩm / Biến thể</span>
            <span>Danh mục</span>
            <span>Giá</span>
            <span className="text-center">Tồn</span>
            <span>Trạng thái</span>
            <span className="text-right">Thao tác</span>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-gray-200 bg-white py-12 text-center text-gray-400">Đang tải...</div>
          ) : (data?.items.length ?? 0) === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white py-12 text-center text-gray-400">Chưa có sản phẩm nào</div>
          ) : (
            <div className="space-y-3">
              {data!.items.map((sp) => {
                const spTt = nhanTrangThaiSp(sp.trangThai);
                const an = sp.trangThai === 'NGUNG_BAN';
                return (
                  <div key={sp.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    {/* Header sản phẩm */}
                    <div className={cn(GRID, 'bg-gray-50 px-4 py-3')}>
                      <div className="flex min-w-0 items-center gap-3">
                        <ProductImage src={sp.anhChinh} alt={sp.tenSanPham} className="h-12 w-12 shrink-0 rounded-lg border border-gray-100" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">{sp.tenSanPham}</p>
                          <p className="truncate text-xs text-gray-500">
                            {sp.thuongHieu ? `${sp.thuongHieu} · ` : ''}{sp.soBienThe} biến thể
                          </p>
                        </div>
                      </div>
                      <span className="truncate text-sm text-gray-600">
                        {sp.tenDanhMuc}{sp.tenPhanLoai ? ` › ${sp.tenPhanLoai}` : ''}
                      </span>
                      <span className="text-sm text-gray-300">—</span>
                      <span className="text-center text-sm font-semibold text-gray-900">{sp.tongTon}</span>
                      <span><StatusBadge label={spTt.label} tone={spTt.tone} /></span>
                      <div className="flex items-center justify-end gap-1">
                        <IconBtn title="Thêm biến thể" onClick={() => setBienTheForm({ sanPhamId: sp.id, phanLoaiId: sp.phanLoaiId, tenSanPham: sp.tenSanPham, editing: null })}><Layers className="h-4 w-4" /></IconBtn>
                        <IconBtn title="Xem chi tiết" onClick={() => setDetailId(sp.id)}><Info className="h-4 w-4" /></IconBtn>
                        <IconBtn title="Sửa" onClick={() => { setEditingId(sp.id); setMoForm(true); }}><Pencil className="h-4 w-4" /></IconBtn>
                        <IconBtn title={an ? 'Hiện' : 'Ẩn'} onClick={() => doiTrangThai.mutate({ id: sp.id, tt: an ? 'CON_HANG' : 'NGUNG_BAN' })}>
                          {an ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </IconBtn>
                        <IconBtn title="Xóa" danger onClick={() => setXoaId(sp.id)}><Trash2 className="h-4 w-4" /></IconBtn>
                      </div>
                    </div>

                    {/* Hàng biến thể */}
                    {sp.bienThes.length === 0 ? (
                      <div className="border-t border-gray-100 px-4 py-3 pl-14 text-xs text-gray-400">
                        Chưa có biến thể — bấm <b>Thêm biến thể</b> để thêm.
                      </div>
                    ) : (
                      sp.bienThes.map((bt) => (
                        <BienTheRow
                          key={bt.id}
                          bt={bt}
                          onView={() => setViewBienThe({ sanPhamId: sp.id, bienTheId: bt.id })}
                          onEdit={() => setBienTheForm({ sanPhamId: sp.id, phanLoaiId: sp.phanLoaiId, tenSanPham: sp.tenSanPham, editing: bt })}
                          onToggle={() =>
                            toggleBienThe.mutate({ id: bt.id, tt: bt.trangThai === 'NGUNG_BAN' ? 'CON_HANG' : 'NGUNG_BAN' })
                          }
                          onDelete={() => setXoaBienTheId(bt.id)}
                        />
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {data && (
        <AdminPagination currentPage={data.currentPage} totalPages={data.totalPages} onChange={setPage} />
      )}

      {/* Modals */}
      {moForm && options && (editingId == null || editing) && (
        <SanPhamFormModal
          options={options}
          editing={editing ?? null}
          onClose={dongForm}
          onSaved={() => { dongForm(); lamMoi(); }}
        />
      )}

      <ConfirmDialog
        open={xoaId != null}
        title="Xóa sản phẩm"
        message="Sản phẩm đã phát sinh đơn/đánh giá sẽ được ẩn thay vì xóa vĩnh viễn. Tiếp tục?"
        confirmLabel="Xóa"
        dangXuLy={xoa.isPending}
        onConfirm={() => xoaId != null && xoa.mutate(xoaId)}
        onClose={() => setXoaId(null)}
      />

      <ConfirmDialog
        open={xoaBienTheId != null}
        title="Xóa biến thể"
        message="Biến thể đã phát sinh đơn sẽ không xóa được (hãy ẩn thay thế). Tiếp tục?"
        confirmLabel="Xóa"
        dangXuLy={xoaBT.isPending}
        onConfirm={() => xoaBienTheId != null && xoaBT.mutate(xoaBienTheId)}
        onClose={() => setXoaBienTheId(null)}
      />

      {detailId != null && (
        <ProductDetailModal id={detailId} onClose={() => setDetailId(null)} />
      )}

      {viewBienThe && (
        <ProductDetailModal
          id={viewBienThe.sanPhamId}
          bienTheId={viewBienThe.bienTheId}
          onClose={() => setViewBienThe(null)}
        />
      )}

      {bienTheForm && (
        <ThemBienTheModal
          sanPhamId={bienTheForm.sanPhamId}
          phanLoaiId={bienTheForm.phanLoaiId}
          tenSanPham={bienTheForm.tenSanPham}
          editing={bienTheForm.editing}
          onClose={() => setBienTheForm(null)}
          onSaved={() => { setBienTheForm(null); lamMoi(); }}
        />
      )}
    </div>
  );
}

function BienTheRow({
  bt,
  onView,
  onEdit,
  onToggle,
  onDelete,
}: {
  bt: BienTheDong;
  onView: () => void;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const tt = nhanTrangThaiBienThe(bt.trangThai);
  const an = bt.trangThai === 'NGUNG_BAN';
  const coKM = bt.giaKhuyenMai != null && bt.giaKhuyenMai < bt.gia;
  const tenBt =
    bt.tenBienThe
    || [...Object.values(bt.thongSoBienThe).map(String), bt.mauSac].filter(Boolean).join(' · ')
    || bt.maBienThe
    || 'Biến thể';

  return (
    <div className={cn(GRID, 'border-t border-gray-100 px-4 py-2.5')}>
      <div className="flex min-w-0 items-center gap-2 pl-6">
        <span className="text-gray-300">└</span>
        <ProductImage src={bt.anhChinh} alt={tenBt} className="h-9 w-9 shrink-0 rounded-md border border-gray-100" />
        <div className="min-w-0">
          <p className="truncate text-sm text-gray-800">{tenBt}</p>
          {bt.maBienThe && <p className="truncate text-xs text-gray-400">{bt.maBienThe}</p>}
        </div>
      </div>
      <span className="text-xs text-gray-300">—</span>
      <span className="text-sm text-gray-800">
        {coKM ? (
          <>
            {formatPrice(bt.giaKhuyenMai as number)}
            <span className="ml-1.5 text-xs text-gray-400 line-through">{formatPrice(bt.gia)}</span>
          </>
        ) : (
          formatPrice(bt.gia)
        )}
      </span>
      <span className="text-center text-sm text-gray-700">{bt.soLuongTon}</span>
      <span><StatusBadge label={tt.label} tone={tt.tone} /></span>
      <div className="flex items-center justify-end gap-1">
        <IconBtn title="Xem chi tiết" onClick={onView}><Info className="h-4 w-4" /></IconBtn>
        <IconBtn title="Sửa" onClick={onEdit}><Pencil className="h-4 w-4" /></IconBtn>
        <IconBtn title={an ? 'Hiện' : 'Ẩn'} onClick={onToggle}>
          {an ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </IconBtn>
        <IconBtn title="Xóa" danger onClick={onDelete}><Trash2 className="h-4 w-4" /></IconBtn>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  title,
  danger,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  danger?: boolean;
  onClick: () => void;
}) {
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
