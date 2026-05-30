'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { addDays, format } from 'date-fns';
import toast from 'react-hot-toast';
import { CheckCircle2, MapPin, Truck, Tag, CreditCard } from 'lucide-react';
import { cartService } from '@/services/cartService';
import { profileService } from '@/services/profileService';
import { orderService } from '@/services/orderService';
import { discountService } from '@/services/discountService';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { useCartStore } from '@/stores/cartStore';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Container } from '@/components/ui/Container';
import { ProductImage } from '@/components/ui/ProductImage';
import { cn, formatPrice } from '@/lib/utils';
import type { DiscountResult, DonHang } from '@/types';

const MIEN_PHI_TU = 5000000;
const PHI_SHIP = 30000;

export default function ThanhToanPage() {
  return (
    <ProtectedRoute>
      <ThanhToanContent />
    </ProtectedRoute>
  );
}

function ThanhToanContent() {
  const qc = useQueryClient();
  const gioHangIds = useCheckoutStore((s) => s.gioHangIds);
  const maGiamGiaInit = useCheckoutStore((s) => s.maGiamGia);
  const resetCheckout = useCheckoutStore((s) => s.reset);
  const setSoLuong = useCartStore((s) => s.setSoLuong);

  const { data: gio } = useQuery({ queryKey: ['gio-hang'], queryFn: cartService.getGioHang });
  const { data: diaChiList } = useQuery({ queryKey: ['dia-chi'], queryFn: profileService.getDiaChi });

  const selectedItems = (gio?.items ?? []).filter((i) => gioHangIds.includes(i.id));

  const [selectedAddrId, setSelectedAddrId] = useState<number | null>(null);
  const [moNhapTay, setMoNhapTay] = useState(false);
  const [manual, setManual] = useState({ hoTen: '', sdt: '', diaChi: '' });
  const [maCode, setMaCode] = useState(maGiamGiaInit ?? '');
  const [voucher, setVoucher] = useState<DiscountResult | null>(null);
  const [dangApMa, setDangApMa] = useState(false);
  const [ghiChu, setGhiChu] = useState('');
  const [dangDat, setDangDat] = useState(false);
  const [datThanhCong, setDatThanhCong] = useState<DonHang | null>(null);

  // Mặc định chọn địa chỉ mặc định.
  useEffect(() => {
    if (diaChiList && diaChiList.length > 0 && selectedAddrId === null) {
      const md = diaChiList.find((d) => d.laMacDinh) ?? diaChiList[0];
      setSelectedAddrId(md.id);
    }
  }, [diaChiList, selectedAddrId]);

  const tamTinh = selectedItems.reduce((s, i) => s + i.thanhTien, 0);
  const phiShip = tamTinh === 0 || tamTinh >= MIEN_PHI_TU ? 0 : PHI_SHIP;
  const giam = voucher?.tienGiam ?? 0;
  const tongCong = Math.max(0, tamTinh - giam) + phiShip;

  // Áp lại mã đã chọn từ giỏ.
  useEffect(() => {
    if (maGiamGiaInit && selectedItems.length > 0 && !voucher) {
      discountService
        .apDung(maGiamGiaInit, tamTinh, selectedItems.map((i) => i.sanPhamId))
        .then(setVoucher)
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maGiamGiaInit, selectedItems.length]);

  const apMa = async () => {
    if (!maCode.trim()) return;
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

  const datHang = async () => {
    let hoTen: string;
    let sdt: string;
    let diaChi: string;
    const dungSoDiaChi = diaChiList && diaChiList.length > 0 && !moNhapTay;

    if (dungSoDiaChi) {
      const addr = diaChiList.find((d) => d.id === selectedAddrId);
      if (!addr) {
        toast.error('Vui lòng chọn địa chỉ nhận hàng');
        return;
      }
      hoTen = addr.hoTenNguoiNhan;
      sdt = addr.soDienThoai;
      diaChi = addr.diaChiDayDu;
    } else {
      hoTen = manual.hoTen.trim();
      sdt = manual.sdt.trim();
      diaChi = manual.diaChi.trim();
      if (!hoTen || !sdt || !diaChi) {
        toast.error('Vui lòng nhập đủ họ tên, số điện thoại và địa chỉ');
        return;
      }
      if (!/^0\d{9}$/.test(sdt)) {
        toast.error('Số điện thoại không hợp lệ');
        return;
      }
    }

    if (selectedItems.length === 0) {
      toast.error('Không có sản phẩm để đặt hàng');
      return;
    }

    setDangDat(true);
    try {
      const don = await orderService.datHang({
        hoTenNguoiNhan: hoTen,
        soDienThoaiNhan: sdt,
        diaChiGiaoHang: diaChi,
        gioHangIds,
        maGiamGia: voucher?.maCode || undefined,
        ghiChu: ghiChu.trim() || undefined,
      });
      // Giỏ đã bị trừ các item vừa đặt → làm mới cache + badge.
      try {
        const fresh = await cartService.getGioHang();
        qc.setQueryData(['gio-hang'], fresh);
        setSoLuong(fresh.tongSoLuong);
      } catch {
        /* */
      }
      resetCheckout();
      setDatThanhCong(don);
    } catch {
      /* interceptor toast */
    } finally {
      setDangDat(false);
    }
  };

  // ─── Đặt hàng thành công ───
  if (datThanhCong) {
    return (
      <Container className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-800">Đặt hàng thành công!</h1>
        <p className="mt-2 text-gray-600">
          Mã đơn hàng: <span className="font-bold text-primary">{datThanhCong.maDonHang}</span>
        </p>
        <p className="text-gray-600">
          Tổng thanh toán: <span className="font-semibold text-sale">{formatPrice(datThanhCong.tongThanhToan)}</span>{' '}
          — Thanh toán khi nhận hàng (COD)
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href={`/lich-su-mua-hang/${datThanhCong.maDonHang}`}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Xem đơn hàng
          </Link>
          <Link href="/" className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
            Tiếp tục mua sắm
          </Link>
        </div>
      </Container>
    );
  }

  // ─── Chưa chọn sản phẩm ───
  if (gioHangIds.length === 0 || selectedItems.length === 0) {
    return (
      <Container className="py-16 text-center text-gray-500">
        Bạn chưa chọn sản phẩm để thanh toán.{' '}
        <Link href="/gio-hang" className="text-primary hover:underline">
          Về giỏ hàng
        </Link>
      </Container>
    );
  }

  const coSoDiaChi = diaChiList && diaChiList.length > 0;

  return (
    <Container className="py-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Cột trái */}
        <div className="space-y-4 lg:col-span-2">
          {/* Địa chỉ nhận hàng */}
          <section className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-gray-800">
                <MapPin className="h-5 w-5 text-primary" /> Địa chỉ nhận hàng
              </h2>
              {coSoDiaChi && (
                <button
                  type="button"
                  onClick={() => setMoNhapTay((v) => !v)}
                  className="text-sm text-primary hover:underline"
                >
                  {moNhapTay ? 'Chọn từ sổ địa chỉ' : 'Nhập địa chỉ khác'}
                </button>
              )}
            </div>

            {coSoDiaChi && !moNhapTay ? (
              <div className="space-y-2">
                {diaChiList.map((d) => (
                  <label
                    key={d.id}
                    className={cn(
                      'flex cursor-pointer gap-3 rounded-lg border p-3',
                      d.id === selectedAddrId ? 'border-primary bg-primary-50' : 'border-gray-200',
                    )}
                  >
                    <input
                      type="radio"
                      name="diaChi"
                      checked={d.id === selectedAddrId}
                      onChange={() => setSelectedAddrId(d.id)}
                      className="mt-1"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-gray-800">
                        {d.hoTenNguoiNhan} · {d.soDienThoai}
                        {d.laMacDinh && (
                          <span className="ml-2 rounded bg-primary-100 px-1.5 py-0.5 text-[11px] text-primary">
                            Mặc định
                          </span>
                        )}
                      </p>
                      <p className="text-gray-600">{d.diaChiDayDu}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  value={manual.hoTen}
                  onChange={(e) => setManual({ ...manual, hoTen: e.target.value })}
                  placeholder="Họ tên người nhận"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <input
                  value={manual.sdt}
                  onChange={(e) => setManual({ ...manual, sdt: e.target.value })}
                  placeholder="Số điện thoại (0xxxxxxxxx)"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <input
                  value={manual.diaChi}
                  onChange={(e) => setManual({ ...manual, diaChi: e.target.value })}
                  placeholder="Địa chỉ giao hàng (số nhà, đường, phường, quận, tỉnh)"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none sm:col-span-2"
                />
              </div>
            )}
          </section>

          {/* Phương thức thanh toán */}
          <section className="rounded-xl border border-gray-100 bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-gray-800">
              <CreditCard className="h-5 w-5 text-primary" /> Phương thức thanh toán
            </h2>
            <div className="space-y-2">
              <label className="flex items-center gap-3 rounded-lg border border-primary bg-primary-50 p-3 text-sm">
                <input type="radio" name="pay" checked readOnly />
                <span className="font-medium text-gray-800">Thanh toán khi nhận hàng (COD)</span>
              </label>
              <label className="flex cursor-not-allowed items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm text-gray-400">
                <input type="radio" name="pay" disabled />
                Trả góp / Tín dụng <span className="text-xs">(sắp có)</span>
              </label>
              <label className="flex cursor-not-allowed items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm text-gray-400">
                <input type="radio" name="pay" disabled />
                Ví điện tử <span className="text-xs">(sắp có)</span>
              </label>
            </div>
          </section>

          {/* Mã giảm giá */}
          <section className="rounded-xl border border-gray-100 bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2 font-bold text-gray-800">
              <Tag className="h-5 w-5 text-primary" /> Mã giảm giá
            </h2>
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
            {voucher && (
              <p className="mt-2 text-sm text-green-600">
                Đã áp mã <b>{voucher.maCode}</b> — giảm {formatPrice(voucher.tienGiam)}
              </p>
            )}
          </section>

          {/* Ngày giao dự kiến */}
          <section className="rounded-xl border border-gray-100 bg-white p-4">
            <h2 className="mb-2 flex items-center gap-2 font-bold text-gray-800">
              <Truck className="h-5 w-5 text-primary" /> Ngày giao hàng dự kiến
            </h2>
            <p className="text-sm text-gray-600">
              Dự kiến giao: {format(addDays(new Date(), 2), 'dd/MM/yyyy')} –{' '}
              {format(addDays(new Date(), 4), 'dd/MM/yyyy')}
            </p>
            <textarea
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
              rows={2}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </section>
        </div>

        {/* Cột phải — tóm tắt */}
        <div className="h-fit rounded-xl border border-gray-100 bg-white p-4 lg:sticky lg:top-20">
          <h2 className="mb-3 font-bold text-gray-800">Tóm tắt đơn hàng</h2>
          <ul className="max-h-64 space-y-3 overflow-y-auto">
            {selectedItems.map((i) => (
              <li key={i.id} className="flex gap-2">
                <ProductImage src={i.anhChinh} alt={i.tenSanPham} className="h-12 w-12 shrink-0 rounded" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="line-clamp-1 text-gray-800">{i.tenSanPham}</p>
                  <p className="text-gray-500">
                    {formatPrice(i.gia)} × {i.soLuong}
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-800">{formatPrice(i.thanhTien)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-gray-100 pt-3 text-sm">
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
                <dt className="text-gray-500">Giảm giá</dt>
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
            onClick={datHang}
            disabled={dangDat}
            className="mt-4 w-full rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {dangDat ? 'Đang đặt hàng...' : 'ĐẶT HÀNG NGAY'}
          </button>
          <p className="mt-2 text-center text-xs text-gray-400">Giao dịch được bảo mật &amp; mã hóa</p>
        </div>
      </div>
    </Container>
  );
}
