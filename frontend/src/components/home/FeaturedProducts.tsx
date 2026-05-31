'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { productService } from '@/services/productService';
import { BienTheCard } from '@/components/product/BienTheCard';
import { DragScroll } from '@/components/ui/DragScroll';

export function FeaturedProducts() {
  // Chỉ lấy sản phẩm gắn tag "Nổi bật" (ma_nhan = 'noi-bat').
  const { data, isLoading } = useQuery({
    queryKey: ['san-pham-noi-bat'],
    queryFn: () => productService.getSanPham({ nhan: 'noi-bat', size: 20 }),
    staleTime: 60 * 1000,
  });

  const items = data?.items ?? [];

  // Không có SP nổi bật nào → ẩn khối (giống Flash Sale).
  if (!isLoading && items.length === 0) return null;

  return (
    <section className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
      {/* Thanh tiêu đề — bố cục giống Flash Sale */}
      <div className="flex items-center justify-between bg-primary px-4 py-2.5 text-white">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          <span className="font-bold">Sản phẩm nổi bật</span>
        </div>
        <Link href="/khuyen-mai" className="text-sm font-medium hover:underline">
          Xem tất cả →
        </Link>
      </div>

      {/* Dải sản phẩm cuộn ngang — kéo trái/phải bằng chuột */}
      {isLoading ? (
        <div className="flex gap-3 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 w-44 shrink-0 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <DragScroll className="p-4">
          {items.map((it) => (
            <div key={it.bienTheId} className="w-44 shrink-0">
              <BienTheCard item={it} />
            </div>
          ))}
        </DragScroll>
      )}
    </section>
  );
}
