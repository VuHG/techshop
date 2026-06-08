'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Zap } from 'lucide-react';
import type { BienTheCard as BienTheCardType } from '@/types';
import { cn, formatPrice } from '@/lib/utils';
import { ProductImage } from '@/components/ui/ProductImage';
import { StarRating } from '@/components/ui/StarRating';
import { MuaNgayModal } from './MuaNgayModal';

/** Nhãn biến thể: ưu tiên tên biến thể, nếu không thì ghép thông số + màu (tối đa 3 giá trị). */
function nhanBienThe(thongSo: Record<string, unknown>, mauSac: string | null): string {
  const vals = Object.values(thongSo)
    .filter((v) => v != null && v !== '')
    .map(String);
  if (mauSac) vals.push(mauSac);
  return vals.slice(0, 3).join(' / ');
}

// Màu nền nhãn theo tên (Tailwind class — không dùng inline style theo quy ước dự án).
const TAG_CLASS: Record<string, string> = {
  Hot: 'bg-red-500',
  'Mới về': 'bg-green-600',
  'Trả góp 0%': 'bg-blue-600',
  'Bán chạy': 'bg-purple-600',
  'Nổi bật': 'bg-primary',
};

export function BienTheCard({ item }: { item: BienTheCardType }) {
  const [modalMode, setModalMode] = useState<null | 'mua-ngay' | 'them-gio'>(null);
  const { slug, bienTheId, tenSanPham, tenBienThe, mauSac, thongSoBienThe, anhChinh, gia, giaBan, phanTramGiam } = item;
  const href = `/san-pham/${slug}?bienThe=${bienTheId}`;
  const coGiam = phanTramGiam > 0 && giaBan < gia;
  const isFlash = item.flashSale; // → dùng màu Flash Sale (đỏ/sale + gradient) giống mục Flash Sale
  const nhanBt = tenBienThe || nhanBienThe(thongSoBienThe, mauSac);
  // Bỏ nhãn "Sale" vì đã có badge % giảm giá bên trái.
  const tags = item.nhans.filter((n) => n.tenNhan.toLowerCase() !== 'sale');

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      {/* Hàng nhãn trên cùng: badge % (trái) + các nhãn, flex-wrap sát nhau, đầy thì xuống dòng */}
      {(coGiam || isFlash || tags.length > 0) && (
        <div className="absolute inset-x-2 top-2 z-10 flex flex-wrap gap-1">
          {(coGiam || isFlash) && (
            <span className="flex items-center gap-0.5 rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {isFlash && <Zap className="h-3 w-3" />}-{phanTramGiam}%
            </span>
          )}
          {tags.map((n) => (
            <span
              key={n.id}
              className={cn(
                'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-white',
                TAG_CLASS[n.tenNhan] ?? 'bg-gray-500',
              )}
            >
              {n.tenNhan}
            </span>
          ))}
        </div>
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
            onClick={() => setModalMode('mua-ngay')}
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
            aria-label="Thêm vào giỏ hàng"
            onClick={() => setModalMode('them-gio')}
            className={cn(
              'flex items-center justify-center rounded-lg px-3 text-white transition',
              isFlash ? 'bg-sale hover:bg-sale-dark' : 'bg-primary hover:bg-primary-dark',
            )}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>

      {modalMode && (
        <MuaNgayModal
          slug={slug}
          bienTheIdMacDinh={bienTheId}
          mode={modalMode}
          onClose={() => setModalMode(null)}
        />
      )}
    </div>
  );
}
