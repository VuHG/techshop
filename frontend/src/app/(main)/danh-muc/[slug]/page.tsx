import { ProductListing } from '@/components/product/ProductListing';
import { timTenDanhMuc } from '@/lib/constants';

export function generateMetadata({ params }: { params: { slug: string } }) {
  return { title: timTenDanhMuc(params.slug) };
}

export default function DanhMucPage({ params }: { params: { slug: string } }) {
  return <ProductListing title={timTenDanhMuc(params.slug)} danhMucSlug={params.slug} />;
}
