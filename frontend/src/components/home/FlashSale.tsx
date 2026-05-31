'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Zap } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import { flashSaleService } from '@/services/flashSaleService';
import { ProductImage } from '@/components/ui/ProductImage';
import { DragScroll } from '@/components/ui/DragScroll';
import { formatPrice } from '@/lib/utils';
import type { FlashSaleItem } from '@/types';

export function FlashSale() {
  const { data: items } = useQuery({
    queryKey: ['flash-sale'],
    queryFn: flashSaleService.getDangDienRa,
    staleTime: 60 * 1000,
  });

  // Đếm ngược tới mốc kết thúc sớm nhất trong các flash sale đang diễn ra.
  const ketThucSomNhat = items?.length
    ? new Date(Math.min(...items.map((i) => new Date(i.thoiGianKetThuc).getTime())))
    : undefined;
  const { gio, phut, giay } = useCountdown(ketThucSomNhat);

  if (!items || items.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm">
      {/* Thanh tiêu đề đỏ */}
      <div className="flex items-center justify-between bg-flash-gradient px-4 py-2.5 text-white">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          <span className="font-bold">Flash Sale</span>
          <span className="hidden text-sm sm:inline">Kết thúc sau:</span>
          <span className="flex items-center gap-1">
            <Box>{gio}</Box>:<Box>{phut}</Box>:<Box>{giay}</Box>
          </span>
        </div>
        <Link href="/khuyen-mai" className="text-sm font-medium hover:underline">
          Xem tất cả →
        </Link>
      </div>

      {/* Dải sản phẩm cuộn ngang — kéo trái/phải bằng chuột */}
      <DragScroll className="p-4">
        {items.map((it) => (
          <div key={it.flashSaleId} className="w-44 shrink-0">
            <FlashCard item={it} />
          </div>
        ))}
      </DragScroll>
    </section>
  );
}

function FlashCard({ item }: { item: FlashSaleItem }) {
  const daBan = item.soLuongDaBan ?? 0;
  const gioiHan = item.soLuongGioiHan ?? 0;
  const phanTramBan = gioiHan > 0 ? Math.min(100, Math.round((daBan / gioiHan) * 100)) : 0;

  return (
    <Link
      href={`/san-pham/${item.slug}?bienThe=${item.bienTheId}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative p-3">
        {item.phanTramGiam > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            -{item.phanTramGiam}%
          </span>
        )}
        <ProductImage
          src={item.anhChinh}
          alt={item.tenSanPham}
          className="aspect-square w-full rounded-lg"
        />
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm font-medium text-gray-800 group-hover:text-primary">
          {item.tenSanPham}
        </p>

        <div className="mt-1">
          <span className="text-base font-bold text-sale">{formatPrice(item.giaFlashSale)}</span>
          {item.giaGoc != null && item.giaGoc > item.giaFlashSale && (
            <span className="ml-1 text-xs text-gray-400 line-through">
              {formatPrice(item.giaGoc)}
            </span>
          )}
        </div>

        {/* Thanh tiến độ đã bán */}
        <div className="mt-2">
          <div className="h-3.5 w-full overflow-hidden rounded-full bg-orange-100">
            <div
              className="h-full rounded-full bg-flash-gradient"
              style={{ width: `${Math.max(phanTramBan, 8)}%` }}
            />
          </div>
          <p className="mt-0.5 text-[11px] text-gray-500">Đã bán {daBan}</p>
        </div>
      </div>
    </Link>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-black/25 px-1.5 py-0.5 text-sm font-bold tabular-nums">
      {children}
    </span>
  );
}
