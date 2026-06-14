'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, ShoppingCart, Users, Clock, Wallet } from 'lucide-react';
import { formatPrice, formatNgay, cn } from '@/lib/utils';
import { adminDashboardService } from './_services/adminDashboardService';
import { PageHeader } from './_components/PageHeader';
import { StatusBadge } from './_components/StatusBadge';
import { nhanTrangThai } from './_lib/orderStatus';

const RANGES = [
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: '90d', label: '90 ngày' },
];

const DONUT_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

function gonTien(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}tr`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}k`;
  return String(v);
}

export default function AdminDashboardPage() {
  const [range, setRange] = useState('30d');
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard', range],
    queryFn: () => adminDashboardService.get(range),
  });

  return (
    <div>
      <PageHeader
        title="Tổng quan"
        subtitle="Bảng điều khiển quản trị TechShop"
        action={
          <div className="flex gap-1 rounded-lg bg-white p-1 ring-1 ring-gray-200">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition',
                  range === r.value ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100',
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {isLoading || !data ? (
        // Khung skeleton hiện ngay (load từng phần) — tránh cảm giác màn hình bị đơ khi chờ backend.
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="h-80 animate-pulse rounded-xl border border-gray-200 bg-gray-100 lg:col-span-2" />
            <div className="h-80 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
          </div>
          <div className="h-56 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={<Wallet className="h-5 w-5" />}
              label="Tổng doanh thu"
              value={formatPrice(data.kpi.tongDoanhThu)}
              change={data.kpi.doanhThuThayDoi}
            />
            <KpiCard
              icon={<ShoppingCart className="h-5 w-5" />}
              label="Đơn mới"
              value={String(data.kpi.donMoi)}
              change={data.kpi.donThayDoi}
            />
            <KpiCard
              icon={<Users className="h-5 w-5" />}
              label="Khách mới"
              value={String(data.kpi.khachMoi)}
              change={data.kpi.khachThayDoi}
            />
            <KpiCard
              icon={<Clock className="h-5 w-5" />}
              label="Đơn chờ xử lý"
              value={String(data.kpi.donChoXuLy)}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
              <h3 className="mb-4 font-semibold text-gray-900">Doanh thu theo ngày</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.doanhThuTheoNgay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="ngay" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={gonTien} width={45} />
                  <Tooltip formatter={(v) => formatPrice(Number(v))} labelFormatter={(l) => `Ngày ${l}`} />
                  <Line type="monotone" dataKey="doanhThu" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-4 font-semibold text-gray-900">Doanh thu theo danh mục</h3>
              {data.doanhThuTheoDanhMuc.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400">Chưa có dữ liệu</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={data.doanhThuTheoDanhMuc}
                      dataKey="doanhThu"
                      nameKey="tenDanhMuc"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {data.doanhThuTheoDanhMuc.map((_, i) => (
                        <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatPrice(Number(v))} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Đơn mới nhất */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 font-semibold text-gray-900">Đơn hàng mới nhất</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500">
                    <th className="pb-2">Mã đơn</th>
                    <th className="pb-2">Khách</th>
                    <th className="pb-2">Ngày</th>
                    <th className="pb-2 text-right">Tổng tiền</th>
                    <th className="pb-2 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.donMoiNhat.map((o) => (
                    <tr key={o.id}>
                      <td className="py-2.5 font-semibold text-primary">{o.maDonHang}</td>
                      <td className="py-2.5">{o.hoTenNguoiNhan}</td>
                      <td className="py-2.5 text-gray-500">{formatNgay(o.ngayTao)}</td>
                      <td className="py-2.5 text-right font-medium">{formatPrice(o.tongThanhToan)}</td>
                      <td className="py-2.5 text-right">
                        <StatusBadge {...nhanTrangThai(o.trangThai)} />
                      </td>
                    </tr>
                  ))}
                  {data.donMoiNhat.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        Chưa có đơn hàng
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  change,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: number | null;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        {change != null && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-xs font-semibold',
              change >= 0 ? 'text-green-600' : 'text-red-600',
            )}
          >
            {change >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
