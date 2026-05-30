'use client';

import Link from 'next/link';
import { ShoppingCart, Zap } from 'lucide-react';
import type { SanPham } from '@/types';
import { cn, formatPrice, tinhPhanTramGiam } from '@/lib/utils';
import { ProductImage } from '@/components/ui/ProductImage';
import { StarRating } from '@/components/ui/StarRating';

interface ProductCardProps {
  sanPham: SanPham;
  variant?: 'default' | 'flash';
}

export function ProductCard({ sanPham, variant = 'default' }: ProductCardProps) {
  const { slug, tenSanPham, giaBan, giaGoc, diemDanhGiaTb, soLuotDanhGia, daBan, tongSoLuong } =
    sanPham;
  const phanTramGiam = giaGoc ? tinhPhanTramGiam(giaGoc, giaBan) : 0;
  const isFlash = variant === 'flash';
  const phanTramDaBan =
    daBan && tongSoLuong ? Math.min(100, Math.round((daBan / tongSoLuong) * 100)) : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      {/* Badge giảm giá + Hot */}
      {phanTramGiam > 0 && (
        <span className="absolute left-0 top-0 z-10 rounded-br-lg bg-sale px-2 py-0.5 text-xs font-semibold text-white">
          -{phanTramGiam}%
        </span>
      )}
      {!isFlash && (
        <span className="absolute right-2 top-2 z-10 rounded bg-sale px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
          Hot
        </span>
      )}

      <Link href={`/san-pham/${slug}`} className="block p-3">
        <ProductImage src={sanPham.duongDanAnhChinh} alt={tenSanPham} className="aspect-square w-full rounded-lg" />
      </Link>

      <div className="flex flex-1 flex-col px-3 pb-3">
        <Link
          href={`/san-pham/${slug}`}
          className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-gray-800 hover:text-primary"
        >
          {tenSanPham}
        </Link>

        <div className="mt-1 flex items-center gap-1">
          <StarRating diem={diemDanhGiaTb} />
          <span className="text-xs text-gray-500">({soLuotDanhGia})</span>
        </div>

        <div className="mt-1 flex items-baseline gap-2">
          <span className={cn('text-base font-bold', isFlash ? 'text-sale' : 'text-primary')}>
            {formatPrice(giaBan)}
          </span>
          {giaGoc && giaGoc > giaBan && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(giaGoc)}</span>
          )}
        </div>

        {/* Thanh "đã bán" chỉ cho flash-sale */}
        {isFlash && tongSoLuong && (
          <div className="mt-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-orange-100">
              <div className="h-full bg-flash-gradient" style={{ width: `${phanTramDaBan}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-gray-500">
              Đã bán {daBan}/{tongSoLuong}
            </p>
          </div>
        )}

        {/* Nút mua */}
        <div className="mt-3 flex items-stretch gap-2">
          <button
            type="button"
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
            aria-label="Thêm vào giỏ"
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
