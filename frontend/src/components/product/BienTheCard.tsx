'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Zap } from 'lucide-react';
import type { BienTheCard as BienTheCardType } from '@/types';
import { cn, formatPrice } from '@/lib/utils';
import { ProductImage } from '@/components/ui/ProductImage';
import { StarRating } from '@/components/ui/StarRating';

/** Nhãn biến thể từ thông số (vd "16GB / Đen / 512GB"), tối đa 3 giá trị. */
function nhanBienThe(thongSo: Record<string, unknown>): string {
  return Object.values(thongSo)
    .filter((v) => v != null && v !== '')
    .slice(0, 3)
    .join(' / ');
}

export function BienTheCard({ item }: { item: BienTheCardType }) {
  const router = useRouter();
  const { slug, bienTheId, tenSanPham, thongSoBienThe, anhChinh, gia, giaBan, phanTramGiam } = item;
  const href = `/san-pham/${slug}?bienThe=${bienTheId}`;
  const coGiam = phanTramGiam > 0 && giaBan < gia;
  const isFlash = item.flashSale; // → dùng màu Flash Sale (đỏ/sale + gradient) giống mục Flash Sale
  const nhanBt = nhanBienThe(thongSoBienThe);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      {/* Nhãn từ DB (Hot/Sale...) */}
      {item.nhans.length > 0 && (
        <span className="absolute right-2 top-2 z-10 rounded bg-sale px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
          {item.nhans[0].tenNhan}
        </span>
      )}
      {/* Badge % giảm — flash sale dùng màu sale + tia chớp, ngược lại màu primary */}
      {(coGiam || isFlash) && (
        <span
          className={cn(
            'absolute left-2 top-2 z-10 flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold text-white',
            isFlash ? 'bg-sale' : 'bg-primary',
          )}
        >
          {isFlash && <Zap className="h-3 w-3" />}-{phanTramGiam}%
        </span>
      )}

      <Link href={href} className="block p-3">
        <ProductImage src={anhChinh} alt={tenSanPham} className="aspect-square w-full rounded-lg" />
      </Link>

      <div className="flex flex-1 flex-col px-3 pb-3">
        <Link
          href={href}
          className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-gray-800 hover:text-primary"
        >
          {tenSanPham}
        </Link>

        {nhanBt && <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{nhanBt}</p>}

        <div className="mt-1 flex items-center gap-1">
          <StarRating diem={item.diemDanhGiaTb} />
          <span className="text-xs text-gray-500">({item.soLuotDanhGia})</span>
        </div>

        <div className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
          <span className={cn('text-base font-bold', isFlash ? 'text-sale' : 'text-primary')}>
            {formatPrice(giaBan)}
          </span>
          {coGiam && <span className="text-xs text-gray-400 line-through">{formatPrice(gia)}</span>}
        </div>

        <div className="mt-3 flex items-stretch gap-2">
          <button
            type="button"
            onClick={() => router.push(href)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-sm font-semibold text-white transition',
              isFlash ? 'bg-flash-gradient hover:opacity-90' : 'bg-primary hover:bg-primary-dark',
            )}
          >
            {isFlash && <Zap className="h-4 w-4" />}
            {isFlash ? 'MUA NGAY' : 'Mua ngay'}
          </button>
          <button
            type="button"
            aria-label="Xem sản phẩm"
            onClick={() => router.push(href)}
            className={cn(
              'flex items-center justify-center rounded-lg px-3 text-white transition',
              isFlash ? 'bg-sale hover:bg-sale-dark' : 'bg-primary hover:bg-primary-dark',
            )}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
