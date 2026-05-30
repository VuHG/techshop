import { ProductDetail } from '@/components/product/ProductDetail';

export default function SanPhamPage({ params }: { params: { slug: string } }) {
  return <ProductDetail slug={params.slug} />;
}
