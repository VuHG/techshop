'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Search, Plus, Pencil, Eye, EyeOff, Trash2, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice, cn } from '@/lib/utils';
import { ProductImage } from '@/components/ui/ProductImage';
import {
  adminProductService,
  type AdminSanPhamSummary,
} from '../_services/adminProductService';
import { PRODUCT_TABS, nhanTrangThaiSp } from '../_lib/productStatus';
import { PageHeader } from '../_components/PageHeader';
import { DataTable, type Column } from '../_components/DataTable';
import { StatusBadge } from '../_components/StatusBadge';
import { AdminPagination } from '../_components/AdminPagination';
import { ConfirmDialog } from '../_components/ConfirmDialog';
import { SanPhamFormModal } from './SanPhamFormModal';
import { ProductDetailModal } from './ProductDetailModal';

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
    mutationFn: ({ id, tt }: { id: number; tt: string }) =>
      adminProductService.doiTrangThai(id, tt),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái');
      lamMoi();
    },
  });
  const xoa = useMutation({
    mutationFn: (id: number) => adminProductService.xoa(id),
    onSuccess: () => {
      toast.success('Đã xóa sản phẩm');
      setXoaId(null);
      lamMoi();
    },
  });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(0);
  };

  const dongForm = () => {
    setMoForm(false);
    setEditingId(null);
  };

  const columns: Column<AdminSanPhamSummary>[] = [
    {
      header: 'Sản phẩm',
      cell: (sp) => (
        <div className="flex items-center gap-3">
          <ProductImage
            src={sp.anhChinh}
            alt={sp.tenSanPham}
            className="h-12 w-12 shrink-0 rounded-lg border border-gray-100"
          />
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-900">{sp.tenSanPham}</p>
            <p className="truncate text-xs text-gray-500">
              {sp.thuongHieu ? `${sp.thuongHieu} · ` : ''}
              {sp.soBienThe} biến thể
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Danh mục',
      cell: (sp) => (
        <span className="text-gray-600">
          {sp.tenDanhMuc}
          {sp.tenPhanLoai ? ` › ${sp.tenPhanLoai}` : ''}
        </span>
      ),
    },
    {
      header: 'Giá',
      cell: (sp) =>
        sp.giaThap == null ? (
          '—'
        ) : sp.giaThap === sp.giaCao ? (
          formatPrice(sp.giaThap)
        ) : (
          <span className="whitespace-nowrap">
            {formatPrice(sp.giaThap)} – {formatPrice(sp.giaCao as number)}
          </span>
        ),
    },
    { header: 'Tồn', cell: (sp) => sp.tongTon, className: 'text-center' },
    {
      header: 'Trạng thái',
      cell: (sp) => {
        const { label, tone } = nhanTrangThaiSp(sp.trangThai);
        return <StatusBadge label={label} tone={tone} />;
      },
    },
    {
      header: '',
      className: 'text-right',
      cell: (sp) => {
        const an = sp.trangThai === 'NGUNG_BAN';
        return (
          <div className="flex items-center justify-end gap-1">
            <IconBtn title="Xem chi tiết" onClick={() => setDetailId(sp.id)}>
              <Info className="h-4 w-4" />
            </IconBtn>
            <IconBtn title="Sửa" onClick={() => { setEditingId(sp.id); setMoForm(true); }}>
              <Pencil className="h-4 w-4" />
            </IconBtn>
            <IconBtn
              title={an ? 'Hiện' : 'Ẩn'}
              onClick={() =>
                doiTrangThai.mutate({ id: sp.id, tt: an ? 'CON_HANG' : 'NGUNG_BAN' })
              }
            >
              {an ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </IconBtn>
            <IconBtn title="Xóa" danger onClick={() => setXoaId(sp.id)}>
              <Trash2 className="h-4 w-4" />
            </IconBtn>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản lý sản phẩm"
        subtitle="Thêm, sửa, ẩn/hiện sản phẩm và biến thể"
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
                <span className={cn('ml-1.5', active ? 'text-white/80' : 'text-gray-400')}>
                  ({count})
                </span>
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
        <button
          type="submit"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Tìm
        </button>
      </form>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(sp) => sp.id}
        dangTai={isLoading}
        thongBaoRong="Chưa có sản phẩm nào"
      />

      {data && (
        <AdminPagination
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          onChange={setPage}
        />
      )}

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

      {detailId != null && (
        <ProductDetailModal id={detailId} onClose={() => setDetailId(null)} />
      )}
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
