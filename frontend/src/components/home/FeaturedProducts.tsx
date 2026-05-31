'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import { BienTheCard } from '@/components/product/BienTheCard';

export function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ['san-pham-noi-bat'],
    queryFn: () => productService.getSanPham({ sortBy: 'sold', size: 12 }),
    staleTime: 60 * 1000,
  });

  const items = data?.items ?? [];

  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Sản phẩm nổi bật</h2>
        <Link href="/khuyen-mai" className="text-sm font-medium text-primary hover:underline">
          Xem tất cả
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl border border-gray-100 bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((it) => (
            <BienTheCard key={it.bienTheId} item={it} />
          ))}
        </div>
      )}
    </section>
  );
}
