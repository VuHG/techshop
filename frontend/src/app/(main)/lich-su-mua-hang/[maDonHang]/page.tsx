'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, CreditCard } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { cartService } from '@/services/cartService';
import { useCartStore } from '@/stores/cartStore';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { ReviewModal } from '@/components/review/ReviewModal';
import { Container } from '@/components/ui/Container';
import { ProductImage } from '@/components/ui/ProductImage';
import { ORDER_STATUS } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';
import type { DonHang } from '@/types';

export default function ChiTietDonHangPage({ params }: { params: { maDonHang: string } }) {
  return (
    <ProtectedRoute>
      <ChiTietContent maDonHang={params.maDonHang} />
    </ProtectedRoute>
  );
}

function formatNgayGio(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN');
}

function ChiTietContent({ maDonHang }: { maDonHang: string }) {
  const qc = useQueryClient();
  const router = useRouter();
  const setSoLuong = useCartStore((s) => s.setSoLuong);
  const [moReview, setMoReview] = useState(false);

  const { data: don, isLoading, isError } = useQuery({
    queryKey: ['don-hang-chi-tiet', maDonHang],
    queryFn: () => orderService.getChiTiet(maDonHang),
  });

  const lamMoi = () => {
    qc.invalidateQueries({ queryKey: ['don-hang-chi-tiet', maDonHang] });
    qc.invalidateQueries({ queryKey: ['don-hang'] });
  };

  const huy = async () => {
    if (!don || !window.confirm('Bạn chắc chắn muốn hủy đơn này?')) return;
    try {
      await orderService.huyDon(don.id);
      toast.success('Đã hủy đơn hàng');
      lamMoi();
    } catch {
      /* */
    }
  };

  const xacNhan = async () => {
    if (!don) return;
    try {
      await orderService.xacNhan(don.id);
      toast.success('Đã xác nhận nhận hàng');
      lamMoi();
    } catch {
      /* */
    }
  };

  const muaLai = async () => {
    if (!don) return;
    let gioTong = 0;
    for (const item of don.items) {
      try {
        const gio = await cartService.themVaoGio(item.bienTheId, item.soLuong);
        gioTong = gio.tongSoLuong;
      } catch {
        /* item hết hàng → bỏ qua */
      }
    }
    setSoLuong(gioTong);
    qc.invalidateQueries({ queryKey: ['gio-hang'] });
    toast.success('Đã thêm sản phẩm vào giỏ');
    router.push('/gio-hang');
  };

  const danhGia = () => setMoReview(true);

  if (isLoading) {
    return (
      <Container className="py-10">
        <div className="h-96 animate-pulse rounded-xl bg-gray-100" />
      </Container>
    );
  }
  if (isError || !don) {
    return (
      <Container className="py-16 text-center text-gray-500">
        Không tìm thấy đơn hàng.{' '}
        <Link href="/lich-su-mua-hang" className="text-primary hover:underline">
          Về lịch sử mua hàng
        </Link>
      </Container>
    );
  }

  const laCOD = (don.phuongThucThanhToan ?? '').toUpperCase().includes('COD');

  return (
    <Container className="py-5">
      <Link href="/lich-su-mua-hang" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Lịch sử mua hàng
      </Link>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-800">Đơn hàng #{don.maDonHang}</h1>
        <OrderStatusBadge trangThai={don.trangThai} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Timeline */}
        <section className="rounded-xl border border-gray-100 bg-white p-4 lg:col-span-2">
          <h2 className="mb-3 font-bold text-gray-800">Trạng thái đơn hàng</h2>
          <ol className="relative ml-2 border-l-2 border-gray-100">
            {don.lichSu.map((s, i) => (
              <li key={i} className="mb-4 ml-4 last:mb-0">
                <span className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full bg-primary" />
                <p className="text-sm font-medium text-gray-800">
                  {ORDER_STATUS[s.trangThai]?.label ?? s.trangThai}
                </p>
                {s.ghiChu && <p className="text-xs text-gray-500">{s.ghiChu}</p>}
                <p className="text-xs text-gray-400">{formatNgayGio(s.ngayTao)}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Người nhận + thanh toán */}
        <section className="space-y-4">
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <h2 className="mb-2 flex items-center gap-2 font-bold text-gray-800">
              <MapPin className="h-5 w-5 text-primary" /> Người nhận
            </h2>
            <p className="text-sm font-medium text-gray-800">
              {don.hoTenNguoiNhan} · {don.soDienThoaiNhan}
            </p>
            <p className="text-sm text-gray-600">{don.diaChiGiaoHang}</p>
            {don.ghiChu && <p className="mt-1 text-sm text-gray-500">Ghi chú: {don.ghiChu}</p>}
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <h2 className="mb-2 flex items-center gap-2 font-bold text-gray-800">
              <CreditCard className="h-5 w-5 text-primary" /> Thanh toán
            </h2>
            <p className="text-sm text-gray-700">
              {laCOD ? 'Thanh toán khi nhận hàng (COD)' : don.phuongThucThanhToan}
            </p>
          </div>
        </section>
      </div>

      {/* Sản phẩm (snapshot) */}
      <section className="mt-4 rounded-xl border border-gray-100 bg-white p-4">
        <h2 className="mb-3 font-bold text-gray-800">Sản phẩm</h2>
        <ul className="divide-y divide-gray-100">
          {don.items.map((item, i) => (
            <li key={i} className="flex gap-3 py-3">
              <ProductImage src={item.duongDanAnhChinh} alt={item.tenSanPham} className="h-16 w-16 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800">{item.tenSanPham}</p>
                <div className="mt-0.5 flex flex-wrap gap-1">
                  {Object.values(item.thongSoBienThe).map((v, j) => (
                    <span key={j} className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">
                      {String(v)}
                    </span>
                  ))}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {formatPrice(item.giaLucMua)} × {item.soLuong}
                </p>
                {item.tienGiamSanPham != null && item.tienGiamSanPham > 0 && (
                  <p className="mt-0.5 inline-flex rounded bg-sale/10 px-1.5 py-0.5 text-[11px] font-medium text-sale">
                    Giảm trực tiếp: -{formatPrice(item.tienGiamSanPham)}
                  </p>
                )}
              </div>
              <span className="text-sm font-medium text-gray-800">{formatPrice(item.thanhTien)}</span>
            </li>
          ))}
        </ul>

        {/* Tổng kết */}
        <dl className="mt-3 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Tạm tính</dt>
            <dd className="text-gray-800">{formatPrice(don.tongTienHang)}</dd>
          </div>
          {don.tienGiamGia > 0 && (
            <div className="flex justify-between">
              <dt className="text-gray-500">Giảm giá</dt>
              <dd className="text-sale">-{formatPrice(don.tienGiamGia)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-gray-500">Phí vận chuyển</dt>
            <dd className={don.phiVanChuyen === 0 ? 'font-medium text-green-600' : 'text-gray-800'}>
              {don.phiVanChuyen === 0 ? 'Miễn phí' : formatPrice(don.phiVanChuyen)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2">
            <dt className="font-semibold text-gray-800">Tổng cộng</dt>
            <dd className="text-lg font-bold text-sale">{formatPrice(don.tongThanhToan)}</dd>
          </div>
        </dl>
      </section>

      {/* Hành động */}
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {don.trangThai === 'CHO_XU_LY' && (
          <button
            type="button"
            onClick={huy}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Hủy đơn
          </button>
        )}
        {don.trangThai === 'GIAO_THANH_CONG' && (
          <button
            type="button"
            onClick={xacNhan}
            className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
          >
            Xác nhận đã nhận hàng
          </button>
        )}
        {don.trangThai === 'HOAN_THANH' && (
          <button
            type="button"
            onClick={danhGia}
            className="rounded-lg border border-primary px-5 py-2.5 text-sm text-primary hover:bg-primary-50"
          >
            Đánh giá
          </button>
        )}
        {(don.trangThai === 'HOAN_THANH' || don.trangThai === 'DA_HUY') && (
          <button
            type="button"
            onClick={muaLai}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Mua lại
          </button>
        )}
      </div>

      {moReview && (
        <ReviewModal donHangId={don.id} items={don.items} onClose={() => setMoReview(false)} />
      )}
    </Container>
  );
}
