'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Minus, Plus, X } from 'lucide-react';
import { productService } from '@/services/productService';
import { cartService } from '@/services/cartService';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { ProductImage } from '@/components/ui/ProductImage';
import { VariantSelector } from './VariantSelector';
import { formatPrice, giaBienThe } from '@/lib/utils';

/**
 * Form mở từ card: chọn biến thể (mặc định = biến thể đã bấm) + số lượng.
 * - mode='mua-ngay': "Mua hàng" → thêm vào giỏ rồi sang /thanh-toan.
 * - mode='them-gio': "Thêm vào giỏ hàng" → thêm vào giỏ rồi đóng form.
 * "Quay lại" → đóng form.
 */
export function MuaNgayModal({
  slug,
  bienTheIdMacDinh,
  mode = 'mua-ngay',
  onClose,
}: {
  slug: string;
  bienTheIdMacDinh?: number;
  mode?: 'mua-ngay' | 'them-gio';
  onClose: () => void;
}) {
  const laThemGio = mode === 'them-gio';
  const router = useRouter();
  const qc = useQueryClient();
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const setSoLuongGio = useCartStore((s) => s.setSoLuong);
  const setCheckout = useCheckoutStore((s) => s.set);

  const { data: sp, isLoading } = useQuery({
    queryKey: ['san-pham-chi-tiet', slug],
    queryFn: () => productService.getChiTiet(slug),
  });

  const [variantId, setVariantId] = useState<number | null>(null);
  const [soLuong, setSoLuong] = useState(1);
  const [dangMua, setDangMua] = useState(false);

  // Khi có dữ liệu: chọn sẵn biến thể đã bấm (hoặc biến thể đầu nếu không truyền).
  useEffect(() => {
    if (sp && variantId === null) {
      setVariantId(bienTheIdMacDinh ?? sp.bienThes[0]?.id ?? null);
    }
  }, [sp, bienTheIdMacDinh, variantId]);

  const selected = useMemo(
    () => sp?.bienThes.find((b) => b.id === variantId) ?? sp?.bienThes[0],
    [sp, variantId],
  );
  const gia = selected ? giaBienThe(selected) : null;
  const tonKho = selected?.soLuongTon ?? 0;

  const doiBienThe = (id: number) => {
    setVariantId(id);
    setSoLuong(1); // đổi biến thể → reset số lượng
  };

  const doiSoLuong = (delta: number) => {
    setSoLuong((sl) => Math.min(Math.max(1, sl + delta), Math.max(1, tonKho)));
  };

  const xuLy = async () => {
    if (!selected) return;
    if (!isAuth) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      router.push('/dang-nhap');
      return;
    }
    if (tonKho <= 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }
    setDangMua(true);
    try {
      const gioMoi = await cartService.themVaoGio(selected.id, soLuong);
      setSoLuongGio(gioMoi.tongSoLuong);
      qc.setQueryData(['gio-hang'], gioMoi);

      if (laThemGio) {
        // Chỉ thêm vào giỏ rồi đóng form.
        toast.success('Đã thêm vào giỏ hàng');
        onClose();
        return;
      }

      // Mua ngay: lấy dòng giỏ vừa thêm để chuyển sang thanh toán đúng sản phẩm này.
      const line = gioMoi.items.find((it) => it.bienTheId === selected.id);
      if (!line) {
        toast.error('Không thêm được sản phẩm, vui lòng thử lại');
        return;
      }
      setCheckout([line.id], null);
      router.push('/thanh-toan');
    } catch {
      /* interceptor toast */
    } finally {
      setDangMua(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl bg-white p-4 sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">{laThemGio ? 'Thêm vào giỏ hàng' : 'Mua ngay'}</h3>
          <button type="button" aria-label="Đóng" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {isLoading || !sp || !selected ? (
          <div className="h-48 animate-pulse rounded-lg bg-gray-100" />
        ) : (
          <>
            <div className="flex gap-3">
              <ProductImage
                src={selected.anhs?.[0]?.urlAnh ?? null}
                alt={sp.tenSanPham}
                className="h-24 w-24 shrink-0 rounded-lg"
              />
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-medium text-gray-800">{sp.tenSanPham}</p>
                <p className="mt-1 text-xl font-bold text-sale">
                  {gia != null ? formatPrice(gia) : 'Liên hệ'}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {tonKho > 0 ? `Còn ${tonKho} sản phẩm` : 'Hết hàng'}
                </p>
              </div>
            </div>

            {Object.keys(sp.banDoBienThe ?? {}).length > 0 && (
              <div className="mt-4">
                <VariantSelector
                  banDoBienThe={sp.banDoBienThe}
                  bienThes={sp.bienThes}
                  selectedId={selected.id}
                  onSelect={doiBienThe}
                />
              </div>
            )}

            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-gray-700">Số lượng</p>
              <div className="inline-flex items-center rounded-lg border border-gray-300">
                <button
                  type="button"
                  aria-label="Giảm"
                  onClick={() => doiSoLuong(-1)}
                  disabled={soLuong <= 1}
                  className="px-3 py-2 text-gray-600 disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-sm">{soLuong}</span>
                <button
                  type="button"
                  aria-label="Tăng"
                  onClick={() => doiSoLuong(1)}
                  disabled={soLuong >= tonKho}
                  className="px-3 py-2 text-gray-600 disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={xuLy}
                disabled={dangMua || tonKho <= 0}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
              >
                {dangMua ? 'Đang xử lý...' : laThemGio ? 'Thêm vào giỏ hàng' : 'Mua hàng'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
