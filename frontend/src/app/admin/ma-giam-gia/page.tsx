'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Search, Plus, Pencil, Ban, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice, formatNgay, cn } from '@/lib/utils';
import { adminDiscountService, type MaGiamGia } from '../_services/adminDiscountService';
import { DISCOUNT_TABS, nhanTinhTrang } from '../_lib/discountStatus';
import { PageHeader } from '../_components/PageHeader';
import { DataTable, type Column } from '../_components/DataTable';
import { StatusBadge } from '../_components/StatusBadge';
import { AdminPagination } from '../_components/AdminPagination';
import { ConfirmDialog } from '../_components/ConfirmDialog';
import { MaGiamGiaFormModal } from './MaGiamGiaFormModal';

export default function AdminMaGiamGiaPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const [moForm, setMoForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [xoaId, setXoaId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-mgg', tab, search, page],
    queryFn: () => adminDiscountService.getDanhSach(tab, search, page, 20),
    placeholderData: keepPreviousData,
  });
  const { data: editing } = useQuery({
    queryKey: ['admin-mgg-detail', editingId],
    queryFn: () => adminDiscountService.getChiTiet(editingId as number),
    enabled: editingId != null,
  });

  const lamMoi = () => qc.invalidateQueries({ queryKey: ['admin-mgg'] });

  const toggle = useMutation({
    mutationFn: ({ id, tt }: { id: number; tt: string }) => adminDiscountService.doiTrangThai(id, tt),
    onSuccess: () => { toast.success('Đã cập nhật'); lamMoi(); },
  });
  const xoa = useMutation({
    mutationFn: (id: number) => adminDiscountService.xoa(id),
    onSuccess: () => { toast.success('Đã xóa mã'); setXoaId(null); lamMoi(); },
  });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(0);
  };
  const dongForm = () => { setMoForm(false); setEditingId(null); };

  const moTaGiam = (m: MaGiamGia) =>
    m.loaiGiam === 'PHAN_TRAM'
      ? `${Number(m.giaTriGiam)}%${m.giaTriGiamToiDa ? ` (tối đa ${formatPrice(m.giaTriGiamToiDa)})` : ''}`
      : formatPrice(m.giaTriGiam);

  const columns: Column<MaGiamGia>[] = [
    {
      header: 'Mã',
      cell: (m) => (
        <div>
          <p className="font-semibold text-primary">{m.maCode}</p>
          <p className="truncate text-xs text-gray-500">{m.tenMa}</p>
        </div>
      ),
    },
    {
      header: 'Điều kiện',
      cell: (m) => (m.dieuKienToiThieu ? `Từ ${formatPrice(m.dieuKienToiThieu)}` : 'Không'),
    },
    { header: 'Giá trị', cell: (m) => <span className="font-medium">{moTaGiam(m)}</span> },
    {
      header: 'Đã dùng',
      cell: (m) => `${m.soLuongDaDung}/${m.soLuongToiDa}`,
      className: 'text-center',
    },
    {
      header: 'Hiệu lực',
      cell: (m) => (
        <span className="whitespace-nowrap text-xs text-gray-500">
          {formatNgay(m.batDau)} – {formatNgay(m.ketThuc)}
        </span>
      ),
    },
    {
      header: 'Tình trạng',
      cell: (m) => {
        const { label, tone } = nhanTinhTrang(m.tinhTrang);
        return <StatusBadge label={label} tone={tone} />;
      },
    },
    {
      header: '',
      className: 'text-right',
      cell: (m) => (
        <div className="flex items-center justify-end gap-1">
          <IconBtn title="Sửa" onClick={() => { setEditingId(m.id); setMoForm(true); }}>
            <Pencil className="h-4 w-4" />
          </IconBtn>
          <IconBtn
            title={m.trangThai === 'VO_HIEU' ? 'Kích hoạt' : 'Vô hiệu'}
            onClick={() =>
              toggle.mutate({ id: m.id, tt: m.trangThai === 'VO_HIEU' ? 'HOAT_DONG' : 'VO_HIEU' })
            }
          >
            <Ban className="h-4 w-4" />
          </IconBtn>
          <IconBtn title="Xóa" danger onClick={() => setXoaId(m.id)}>
            <Trash2 className="h-4 w-4" />
          </IconBtn>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản lý mã giảm giá"
        subtitle="Tạo và theo dõi các chương trình khuyến mãi"
        action={
          <button
            onClick={() => { setEditingId(null); setMoForm(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> Thêm mã
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {DISCOUNT_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => { setTab(t.value); setPage(0); }}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition',
              tab === t.value
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={onSearch} className="mb-4 flex gap-2">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo mã hoặc tên chương trình..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
          Tìm
        </button>
      </form>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(m) => m.id}
        dangTai={isLoading}
        thongBaoRong="Chưa có mã giảm giá nào"
      />

      {data && (
        <AdminPagination currentPage={data.currentPage} totalPages={data.totalPages} onChange={setPage} />
      )}

      {moForm && (editingId == null || editing) && (
        <MaGiamGiaFormModal
          editing={editing ?? null}
          onClose={dongForm}
          onSaved={() => { dongForm(); lamMoi(); }}
        />
      )}

      <ConfirmDialog
        open={xoaId != null}
        title="Xóa mã giảm giá"
        message="Mã đã được sử dụng sẽ bị vô hiệu thay vì xóa. Tiếp tục?"
        confirmLabel="Xóa"
        dangXuLy={xoa.isPending}
        onConfirm={() => xoaId != null && xoa.mutate(xoaId)}
        onClose={() => setXoaId(null)}
      />
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
