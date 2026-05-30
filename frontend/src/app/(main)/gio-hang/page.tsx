'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { cartService } from '@/services/cartService';
import { discountService } from '@/services/discountService';
import { useCartStore } from '@/stores/cartStore';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Container } from '@/components/ui/Container';
import { ProductImage } from '@/components/ui/ProductImage';
import { cn, formatPrice } from '@/lib/utils';
import type { DiscountResult, GioHang, GioHangItem } from '@/types';

const PHI_SHIP = 30000;
const MIEN_PHI_TU = 5000000;

export default function GioHangPage() {
  return (
    <ProtectedRoute>
      <GioHangContent />
    </ProtectedRoute>
  );
}

function GioHangContent() {
  const qc = useQueryClient();
  const router = useRouter();
  const setSoLuong = useCartStore((s) => s.setSoLuong);
  const setCheckout = useCheckoutStore((s) => s.set);

  const { data: gio, isLoading, isError } = useQuery({
    queryKey: ['gio-hang'],
    queryFn: cartService.getGioHang,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const items = gio?.items ?? [];

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [maCode, setMaCode] = useState('');
  const [voucher, setVoucher] = useState<DiscountResult | null>(null);
  const [dangApMa, setDangApMa] = useState(false);

  const idsKey = items.map((i) => i.id).join(',');
  // Khởi tạo / cập nhật lựa chọn = tất cả item còn hàng khi danh sách thay đổi.
  useEffect(() => {
    setSelected(new Set(items.filter((i) => i.conHang).map((i) => i.id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  useEffect(() => {
    if (gio) setSoLuong(gio.tongSoLuong);
  }, [gio, setSoLuong]);

  const applyServer = (data: GioHang) => {
    qc.setQueryData(['gio-hang'], data);
    setSoLuong(data.tongSoLuong);
    setVoucher(null); // tổng thay đổi → mã cũ không còn đúng
  };

  const doiSoLuong = async (item: GioHangItem, sl: number) => {
    if (sl < 1 || sl > item.soLuongTon) return;
    try {
      applyServer(await cartService.capNhatSoLuong(item.id, sl));
    } catch {
      /* interceptor toast */
    }
  };

  const xoa = async (id: number) => {
    try {
      applyServer(await cartService.xoaItem(id));
    } catch {
      /* */
    }
  };

  const xoaDaChon = async () => {
    if (selected.size === 0) return;
    for (const id of [...selected]) {
      try {
        await cartService.xoaItem(id);
      } catch {
        /* */
      }
    }
    applyServer(await cartService.getGioHang());
  };

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setVoucher(null);
  };

  const conHangIds = items.filter((i) => i.conHang).map((i) => i.id);
  const chonTatCa = conHangIds.length > 0 && conHangIds.every((id) => selected.has(id));
  const toggleTatCa = () => {
    setSelected(chonTatCa ? new Set() : new Set(conHangIds));
    setVoucher(null);
  };

  const selectedItems = items.filter((i) => selected.has(i.id));
  const tamTinh = selectedItems.reduce((s, i) => s + i.thanhTien, 0);
  const phiShip = tamTinh === 0 || tamTinh >= MIEN_PHI_TU ? 0 : PHI_SHIP;
  const giam = voucher?.tienGiam ?? 0;
  const tongCong = Math.max(0, tamTinh - giam) + phiShip;

  const apMa = async () => {
    if (!maCode.trim()) return;
    if (selectedItems.length === 0) {
      toast.error('Vui lòng chọn sản phẩm trước khi áp mã');
      return;
    }
    setDangApMa(true);
    try {
      const kq = await discountService.apDung(
        maCode.trim(),
        tamTinh,
        selectedItems.map((i) => i.sanPhamId),
      );
      setVoucher(kq);
      toast.success(`Áp mã thành công, giảm ${formatPrice(kq.tienGiam)}`);
    } catch {
      setVoucher(null);
    } finally {
      setDangApMa(false);
    }
  };

  const thanhToan = () => {
    if (selectedItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm');
      return;
    }
    setCheckout(
      selectedItems.map((i) => i.id),
      voucher?.maCode ?? null,
    );
    router.push('/thanh-toan');
  };

  if (isLoading) {
    return (
      <Container className="py-10">
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </Container>
    );
  }

  if (isError) {
    return (
      <Container className="py-16 text-center text-gray-500">
        Không tải được giỏ hàng. Vui lòng tải lại trang.
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingCart className="h-16 w-16 text-gray-300" />
        <p className="mt-4 text-gray-500">Giỏ hàng của bạn đang trống.</p>
        <Link
          href="/khuyen-mai"
          className="mt-5 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Mua sắm ngay
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4 text-xl font-bold text-gray-800">Giỏ hàng của bạn ({items.length} món)</h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Danh sách item */}
        <div className="space-y-3 lg:col-span-2">
          <label className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-4 py-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={chonTatCa} onChange={toggleTatCa} className="h-4 w-4" />
            Chọn tất cả ({conHangIds.length})
          </label>

          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                'flex gap-3 rounded-lg border border-gray-100 bg-white p-3',
                !item.conHang && 'opacity-60',
              )}
            >
              <input
                type="checkbox"
                checked={selected.has(item.id)}
                disabled={!item.conHang}
                onChange={() => toggle(item.id)}
                className="mt-1 h-4 w-4 shrink-0"
              />
              <Link href={`/san-pham/${item.slug}`} className="shrink-0">
                <ProductImage src={item.anhChinh} alt={item.tenSanPham} className="h-20 w-20 rounded-lg" />
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/san-pham/${item.slug}`}
                  className="line-clamp-2 text-sm font-medium text-gray-800 hover:text-primary"
                >
                  {item.tenSanPham}
                </Link>
                <div className="mt-1 flex flex-wrap gap-1">
                  {Object.values(item.thongSoBienThe).map((v, i) => (
                    <span key={i} className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">
                      {String(v)}
                    </span>
                  ))}
                </div>
                <p className="mt-1 font-semibold text-sale">{formatPrice(item.gia)}</p>
                {!item.conHang && <p className="text-xs text-sale">Hết hàng / không đủ tồn</p>}

                <div className="mt-2 flex items-center justify-between">
                  {/* Stepper */}
                  <div className="flex items-center rounded-lg border border-gray-300">
                    <button
                      type="button"
                      aria-label="Giảm"
                      onClick={() => doiSoLuong(item, item.soLuong - 1)}
                      disabled={item.soLuong <= 1}
                      className="px-2 py-1 text-gray-600 disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-sm">{item.soLuong}</span>
                    <button
                      type="button"
                      aria-label="Tăng"
                      onClick={() => doiSoLuong(item, item.soLuong + 1)}
                      disabled={item.soLuong >= item.soLuongTon}
                      className="px-2 py-1 text-gray-600 disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <span className="font-semibold text-gray-800">{formatPrice(item.thanhTien)}</span>

                  <button
                    type="button"
                    aria-label="Xóa"
                    onClick={() => xoa(item.id)}
                    className="text-gray-400 hover:text-sale"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={xoaDaChon}
            disabled={selected.size === 0}
            className="text-sm text-sale hover:underline disabled:opacity-40"
          >
            Xóa sản phẩm đã chọn
          </button>
        </div>

        {/* Tóm tắt */}
        <div className="h-fit rounded-xl border border-gray-100 bg-white p-4 lg:sticky lg:top-20">
          <h2 className="mb-3 font-bold text-gray-800">Tóm tắt đơn hàng</h2>

          <div className="flex gap-2">
            <input
              value={maCode}
              onChange={(e) => setMaCode(e.target.value)}
              placeholder="Nhập mã giảm giá"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={apMa}
              disabled={dangApMa}
              className="rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Áp dụng
            </button>
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Tạm tính</dt>
              <dd className="text-gray-800">{formatPrice(tamTinh)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Phí vận chuyển</dt>
              <dd className={phiShip === 0 ? 'font-medium text-green-600' : 'text-gray-800'}>
                {phiShip === 0 ? 'Miễn phí' : formatPrice(phiShip)}
              </dd>
            </div>
            {voucher && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Giảm giá ({voucher.maCode})</dt>
                <dd className="text-sale">-{formatPrice(giam)}</dd>
              </div>
            )}
          </dl>

          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="font-semibold text-gray-800">Tổng cộng</span>
            <span className="text-xl font-bold text-sale">{formatPrice(tongCong)}</span>
          </div>

          <button
            type="button"
            onClick={thanhToan}
            className="mt-4 w-full rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-dark"
          >
            THANH TOÁN ({selectedItems.length})
          </button>
        </div>
      </div>
    </Container>
  );
}
