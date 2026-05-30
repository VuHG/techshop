import { ProductListing } from '@/components/product/ProductListing';

export const metadata = { title: 'Tìm kiếm' };

export default function TimKiemPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q ?? '';
  return <ProductListing title={q ? `Kết quả cho "${q}"` : 'Tìm kiếm'} search={q || undefined} />;
}
