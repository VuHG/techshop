'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Search, UserPlus, Pencil, Lock, Unlock, KeyRound, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatNgay, cn } from '@/lib/utils';
import { adminUserService, type AdminNguoiDung } from '../_services/adminUserService';
import { PageHeader } from '../_components/PageHeader';
import { DataTable, type Column } from '../_components/DataTable';
import { StatusBadge } from '../_components/StatusBadge';
import { AdminPagination } from '../_components/AdminPagination';
import { NguoiDungFormModal } from './NguoiDungFormModal';
import { ResetMatKhauModal } from './ResetMatKhauModal';
import { NguoiDungDetailModal } from './NguoiDungDetailModal';

export default function AdminNguoiDungPage() {
  const qc = useQueryClient();
  const [vaiTro, setVaiTro] = useState('');
  const [trangThai, setTrangThai] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);

  const [moForm, setMoForm] = useState(false);
  const [editing, setEditing] = useState<AdminNguoiDung | null>(null);
  const [resetId, setResetId] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-user', vaiTro, trangThai, search, page],
    queryFn: () => adminUserService.getDanhSach(vaiTro, trangThai, search, page, 20),
    placeholderData: keepPreviousData,
  });

  const lamMoi = () => qc.invalidateQueries({ queryKey: ['admin-user'] });

  const toggle = useMutation({
    mutationFn: ({ id, tt }: { id: number; tt: string }) => adminUserService.doiTrangThai(id, tt),
    onSuccess: () => { toast.success('Đã cập nhật trạng thái'); lamMoi(); },
  });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(0);
  };
  const dongForm = () => { setMoForm(false); setEditing(null); };

  const columns: Column<AdminNguoiDung>[] = [
    {
      header: 'Người dùng',
      cell: (u) => (
        <div>
          <p className="font-medium text-gray-900">{u.hoTen}</p>
          <p className="text-xs text-gray-500">{u.email ?? '—'}</p>
        </div>
      ),
    },
    { header: 'Số điện thoại', cell: (u) => u.soDienThoai },
    {
      header: 'Vai trò',
      cell: (u) => (
        <StatusBadge label={u.vaiTro === 'ADMIN' ? 'Quản trị' : 'Khách hàng'} tone={u.vaiTro === 'ADMIN' ? 'violet' : 'gray'} />
      ),
    },
    { header: 'Ngày đăng ký', cell: (u) => formatNgay(u.ngayTao) },
    {
      header: 'Trạng thái',
      cell: (u) => (
        <StatusBadge
          label={u.trangThai === 'BI_KHOA' ? 'Bị khóa' : u.trangThai === 'CHO_XAC_THUC' ? 'Chờ xác thực' : 'Hoạt động'}
          tone={u.trangThai === 'BI_KHOA' ? 'red' : u.trangThai === 'CHO_XAC_THUC' ? 'amber' : 'green'}
        />
      ),
    },
    {
      header: '',
      className: 'text-right',
      cell: (u) => {
        const khoa = u.trangThai === 'BI_KHOA';
        return (
          <div className="flex items-center justify-end gap-1">
            <IconBtn title="Xem" onClick={() => setDetailId(u.id)}><Eye className="h-4 w-4" /></IconBtn>
            <IconBtn title="Sửa" onClick={() => { setEditing(u); setMoForm(true); }}><Pencil className="h-4 w-4" /></IconBtn>
            <IconBtn title="Đặt lại mật khẩu" onClick={() => setResetId(u.id)}><KeyRound className="h-4 w-4" /></IconBtn>
            <IconBtn
              title={khoa ? 'Mở khóa' : 'Khóa'}
              danger={!khoa}
              onClick={() => toggle.mutate({ id: u.id, tt: khoa ? 'HOAT_DONG' : 'BI_KHOA' })}
            >
              {khoa ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </IconBtn>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản lý người dùng"
        subtitle="Khách hàng và tài khoản quản trị"
        action={
          <button
            onClick={() => { setEditing(null); setMoForm(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <UserPlus className="h-4 w-4" /> Thêm tài khoản
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={vaiTro}
          onChange={(e) => { setVaiTro(e.target.value); setPage(0); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">Tất cả vai trò</option>
          <option value="CUSTOMER">Khách hàng</option>
          <option value="ADMIN">Quản trị</option>
        </select>
        <select
          value={trangThai}
          onChange={(e) => { setTrangThai(e.target.value); setPage(0); }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="HOAT_DONG">Hoạt động</option>
          <option value="BI_KHOA">Bị khóa</option>
          <option value="CHO_XAC_THUC">Chờ xác thực</option>
        </select>
        <form onSubmit={onSearch} className="flex flex-1 gap-2">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên, SĐT, email..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button type="submit" className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
            Tìm
          </button>
        </form>
      </div>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(u) => u.id}
        dangTai={isLoading}
        thongBaoRong="Không có người dùng nào"
      />

      {data && (
        <AdminPagination currentPage={data.currentPage} totalPages={data.totalPages} onChange={setPage} />
      )}

      {moForm && (
        <NguoiDungFormModal editing={editing} onClose={dongForm} onSaved={() => { dongForm(); lamMoi(); }} />
      )}
      {resetId != null && (
        <ResetMatKhauModal id={resetId} onClose={() => setResetId(null)} />
      )}
      {detailId != null && (
        <NguoiDungDetailModal id={detailId} onClose={() => setDetailId(null)} />
      )}
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
