import Link from 'next/link';
import { FEATURED_PRODUCTS } from '@/data/mock';
import { ProductCard } from '@/components/product/ProductCard';

export function FeaturedProducts() {
  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Sản phẩm nổi bật</h2>
        <Link href="/khuyen-mai" className="text-sm font-medium text-primary hover:underline">
          Xem tất cả
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FEATURED_PRODUCTS.map((sp) => (
          <ProductCard key={sp.id} sanPham={sp} />
        ))}
      </div>
    </section>
  );
}
