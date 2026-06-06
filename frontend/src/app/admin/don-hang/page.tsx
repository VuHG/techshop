'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { formatPrice, formatNgay, cn } from '@/lib/utils';
import type { DonHangSummary } from '@/types';
import { adminOrderService } from '../_services/adminOrderService';
import { ORDER_TABS, nhanTrangThai } from '../_lib/orderStatus';
import { PageHeader } from '../_components/PageHeader';
import { DataTable, type Column } from '../_components/DataTable';
import { StatusBadge } from '../_components/StatusBadge';
import { AdminPagination } from '../_components/AdminPagination';

export default function AdminDonHangPage() {
  const router = useRouter();
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);

  const { data: counts } = useQuery({
    queryKey: ['admin-don-hang-counts'],
    queryFn: () => adminOrderService.demTrangThai(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-don-hang', tab, search, page],
    queryFn: () => adminOrderService.getDanhSach(tab, search, page, 20),
    placeholderData: keepPreviousData,
  });

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(0);
  };

  const columns: Column<DonHangSummary>[] = [
    {
      header: 'Mã đơn',
      cell: (d) => <span className="font-semibold text-primary">{d.maDonHang}</span>,
    },
    { header: 'Ngày đặt', cell: (d) => formatNgay(d.ngayTao) },
    {
      header: 'Khách hàng',
      cell: (d) => (
        <div>
          <p className="font-medium text-gray-900">{d.hoTenNguoiNhan}</p>
          <p className="text-xs text-gray-500">{d.soDienThoaiNhan}</p>
        </div>
      ),
    },
    { header: 'SL', cell: (d) => d.soLuongSanPham, className: 'text-center' },
    {
      header: 'Tổng tiền',
      cell: (d) => <span className="font-semibold">{formatPrice(d.tongThanhToan)}</span>,
    },
    { header: 'PTTT', cell: (d) => d.phuongThucThanhToan ?? 'COD' },
    {
      header: 'Trạng thái',
      cell: (d) => {
        const { label, tone } = nhanTrangThai(d.trangThai);
        return <StatusBadge label={label} tone={tone} />;
      },
    },
  ];

  return (
    <div>
      <PageHeader title="Quản lý đơn hàng" subtitle="Theo dõi và xử lý đơn hàng toàn hệ thống" />

      {/* Tabs trạng thái */}
      <div className="mb-4 flex flex-wrap gap-2">
        {ORDER_TABS.map((t) => {
          const active = tab === t.value;
          const count = t.value ? counts?.[t.value] : undefined;
          return (
            <button
              key={t.value}
              onClick={() => {
                setTab(t.value);
                setPage(0);
              }}
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

      {/* Tìm kiếm */}
      <form onSubmit={onSearch} className="mb-4 flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo mã đơn, tên hoặc SĐT người nhận..."
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
        rowKey={(d) => d.id}
        dangTai={isLoading}
        thongBaoRong="Không có đơn hàng nào"
        onRowClick={(d) => router.push(`/admin/don-hang/${d.id}`)}
      />

      {data && (
        <AdminPagination
          currentPage={data.currentPage}
          totalPages={data.totalPages}
          onChange={setPage}
        />
      )}
    </div>
  );
}
