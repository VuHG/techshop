'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Zap } from 'lucide-react';
import type { SanPhamCard } from '@/types';
import { cn, formatPrice } from '@/lib/utils';
import { ProductImage } from '@/components/ui/ProductImage';
import { StarRating } from '@/components/ui/StarRating';

interface ProductCardProps {
  sanPham: SanPhamCard;
  variant?: 'default' | 'flash';
}

export function ProductCard({ sanPham, variant = 'default' }: ProductCardProps) {
  const router = useRouter();
  const { slug, tenSanPham, giaThap, giaCao, diemDanhGiaTb, soLuotDanhGia, anhChinh, nhans } =
    sanPham;
  const isFlash = variant === 'flash';
  const coKhoangGia = giaThap != null && giaCao != null && giaCao > giaThap;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      {/* Nhãn từ DB (Hot/Sale...) */}
      {nhans.length > 0 && (
        <span className="absolute right-2 top-2 z-10 rounded bg-sale px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
          {nhans[0].tenNhan}
        </span>
      )}

      <Link href={`/san-pham/${slug}`} className="block p-3">
        <ProductImage src={anhChinh} alt={tenSanPham} className="aspect-square w-full rounded-lg" />
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

        <div className="mt-1">
          <span className={cn('text-base font-bold', isFlash ? 'text-sale' : 'text-primary')}>
            {giaThap != null ? formatPrice(giaThap) : 'Liên hệ'}
          </span>
          {coKhoangGia && (
            <span className="ml-1 text-xs text-gray-500">– {formatPrice(giaCao!)}</span>
          )}
        </div>

        {/* Nút → mở trang chi tiết để chọn biến thể rồi thêm vào giỏ */}
        <div className="mt-3 flex items-stretch gap-2">
          <button
            type="button"
            onClick={() => router.push(`/san-pham/${slug}`)}
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
            onClick={() => router.push(`/san-pham/${slug}`)}
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
