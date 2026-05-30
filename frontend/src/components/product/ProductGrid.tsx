import { PackageX } from 'lucide-react';
import type { SanPhamCard } from '@/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  items: SanPhamCard[];
  loading?: boolean;
  error?: boolean;
}

export function ProductGrid({ items, loading, error }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 animate-pulse rounded-xl border border-gray-100 bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
        <PackageX className="h-12 w-12 text-gray-300" />
        <p className="mt-3">Không tải được sản phẩm. Vui lòng thử lại.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
        <PackageX className="h-12 w-12 text-gray-300" />
        <p className="mt-3">Không có sản phẩm phù hợp.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((sp) => (
        <ProductCard key={sp.id} sanPham={sp} />
      ))}
    </div>
  );
}
