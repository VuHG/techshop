import type { SanPhamCard } from '@/types';
import { ProductCard } from './ProductCard';

export function RelatedProducts({ items }: { items: SanPhamCard[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xl font-bold text-gray-800">Sản phẩm tương tự</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((sp) => (
          <ProductCard key={sp.id} sanPham={sp} />
        ))}
      </div>
    </section>
  );
}
