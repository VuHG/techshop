'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search, PackageX } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { Container } from '@/components/ui/Container';
import { ProductImage } from '@/components/ui/ProductImage';
import { ORDER_TABS } from '@/lib/constants';
import { cn, formatNgay, formatPrice } from '@/lib/utils';
import type { DonHangSummary } from '@/types';

export default function LichSuMuaHangPage() {
  return (
    <ProtectedRoute>
      <LichSuContent />
    </ProtectedRoute>
  );
}

function LichSuContent() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('');
  const [keyword, setKeyword] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['don-hang', tab],
    queryFn: () => orderService.getDanhSach(tab || undefined),
  });

  const k = keyword.trim().toLowerCase();
  const orders = (data?.items ?? []).filter(
    (o) =>
      !k ||
      o.maDonHang.toLowerCase().includes(k) ||
      (o.tenSanPhamDau ?? '').toLowerCase().includes(k),
  );

  const huy = async (id: number) => {
    if (!window.confirm('Bạn chắc chắn muốn hủy đơn này?')) return;
    try {
      await orderService.huyDon(id);
      toast.success('Đã hủy đơn hàng');
      qc.invalidateQueries({ queryKey: ['don-hang'] });
    } catch {
      /* interceptor toast */
    }
  };

  const xacNhan = async (id: number) => {
    try {
      await orderService.xacNhan(id);
      toast.success('Đã xác nhận nhận hàng');
      qc.invalidateQueries({ queryKey: ['don-hang'] });
    } catch {
      /* */
    }
  };

  const danhGia = () => toast('Tính năng đánh giá sẽ có ở Phase 10', { icon: '⭐' });

  return (
    <Container className="py-5">
      <h1 className="mb-4 text-xl font-bold text-gray-800">Lịch sử mua hàng</h1>

      {/* Tabs */}
      <div className="no-scrollbar mb-4 flex gap-1 overflow-x-auto border-b border-gray-200">
        {ORDER_TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              'whitespace-nowrap border-b-2 px-4 py-2 text-sm transition',
              tab === t.value
                ? 'border-primary font-semibold text-primary'
                : 'border-transparent text-gray-600 hover:text-primary',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm theo mã đơn hàng, tên sản phẩm..."
          className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center text-gray-500">
          <PackageX className="h-12 w-12 text-gray-300" />
          <p className="mt-3">Chưa có đơn hàng nào.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} onHuy={huy} onXacNhan={xacNhan} onDanhGia={danhGia} />
          ))}
        </div>
      )}
    </Container>
  );
}

function OrderCard({
  order,
  onHuy,
  onXacNhan,
  onDanhGia,
}: {
  order: DonHangSummary;
  onHuy: (id: number) => void;
  onXacNhan: (id: number) => void;
  onDanhGia: () => void;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
        <span className="text-sm font-medium text-gray-700">Mã đơn hàng: #{order.maDonHang}</span>
        <OrderStatusBadge trangThai={order.trangThai} className="text-sm" />
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        <ProductImage src={order.anhDaiDien} alt={order.tenSanPhamDau} className="h-16 w-16 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-medium text-gray-800">{order.tenSanPhamDau}</p>
          <p className="text-xs text-gray-500">Số lượng: {order.soLuongSanPham}</p>
          <p className="text-xs text-gray-400">{formatNgay(order.ngayTao)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-4 py-2.5">
        <span className="text-sm">
          Tổng tiền: <span className="font-bold text-sale">{formatPrice(order.tongThanhToan)}</span>
        </span>
        <div className="flex gap-2">
          {order.trangThai === 'CHO_XU_LY' && (
            <button
              type="button"
              onClick={() => onHuy(order.id)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Hủy đơn
            </button>
          )}
          {order.trangThai === 'GIAO_THANH_CONG' && (
            <button
              type="button"
              onClick={() => onXacNhan(order.id)}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
            >
              Đã nhận hàng
            </button>
          )}
          {order.trangThai === 'HOAN_THANH' && (
            <button
              type="button"
              onClick={onDanhGia}
              className="rounded-lg border border-primary px-3 py-1.5 text-sm text-primary hover:bg-primary-50"
            >
              Đánh giá
            </button>
          )}
          <Link
            href={`/lich-su-mua-hang/${order.maDonHang}`}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
}
