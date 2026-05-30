'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ShoppingCart, GitCompare } from 'lucide-react';
import { productService } from '@/services/productService';
import { useCompareStore } from '@/stores/compareStore';
import { Container } from '@/components/ui/Container';
import { StarRating } from '@/components/ui/StarRating';
import { ProductGallery } from './ProductGallery';
import { VariantSelector } from './VariantSelector';
import { ProductReviews } from './ProductReviews';
import { RelatedProducts } from './RelatedProducts';
import { formatPrice, giaBienThe, nhanThongSo } from '@/lib/utils';
import type { SanPhamCard } from '@/types';

export function ProductDetail({ slug }: { slug: string }) {
  const { data: sp, isLoading, isError } = useQuery({
    queryKey: ['san-pham-chi-tiet', slug],
    queryFn: () => productService.getChiTiet(slug),
  });
  const themSoSanh = useCompareStore((s) => s.them);
  const [variantId, setVariantId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <Container className="py-10">
        <div className="h-96 animate-pulse rounded-xl bg-gray-100" />
      </Container>
    );
  }
  if (isError || !sp) {
    return <Container className="py-16 text-center text-gray-500">Không tải được sản phẩm.</Container>;
  }

  const bienThes = sp.bienThes;
  const selected = bienThes.find((b) => b.id === variantId) ?? bienThes[0];
  const gia = selected ? giaBienThe(selected) : null;
  const giaGoc = selected && selected.giaKhuyenMai != null ? selected.gia : null;
  const thongSo = { ...sp.thongSoKyThuat, ...(selected?.thongSoBienThe ?? {}) };

  const themVaoSoSanh = () => {
    const card: SanPhamCard = {
      id: sp.id,
      slug: sp.slug,
      tenSanPham: sp.tenSanPham,
      moTaNgan: sp.moTaNgan,
      thuongHieu: sp.thuongHieu,
      giaThap: gia,
      giaCao: gia,
      diemDanhGiaTb: sp.diemDanhGiaTb,
      soLuotDanhGia: sp.soLuotDanhGia,
      anhChinh: selected?.anhs?.[0]?.urlAnh ?? null,
      nhans: [],
    };
    const ok = themSoSanh(card);
    if (ok) toast.success('Đã thêm vào danh sách so sánh');
    else toast.error('Đã đủ 3 sản phẩm hoặc sản phẩm đã có trong danh sách');
  };

  const chuaCo = () => toast('Giỏ hàng & đặt hàng sẽ có ở Phase 9', { icon: '🛒' });

  return (
    <Container className="py-5">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProductGallery images={selected?.anhs ?? []} alt={sp.tenSanPham} />

        <div>
          <h1 className="text-2xl font-bold text-gray-800">{sp.tenSanPham}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <StarRating diem={sp.diemDanhGiaTb} />
            <span>
              {sp.diemDanhGiaTb.toFixed(1)} · {sp.soLuotDanhGia} đánh giá · Đã bán {sp.soLuotBan}
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3 rounded-lg bg-gray-50 p-4">
            <span className="text-3xl font-bold text-sale">
              {gia != null ? formatPrice(gia) : 'Liên hệ'}
            </span>
            {giaGoc && <span className="text-gray-400 line-through">{formatPrice(giaGoc)}</span>}
          </div>

          {bienThes.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-gray-700">Phiên bản</p>
              <VariantSelector
                bienThes={bienThes}
                selectedId={selected?.id ?? 0}
                onSelect={setVariantId}
              />
            </div>
          )}

          <p className="mt-3 text-sm text-gray-600">
            {selected && selected.soLuongTon > 0 ? `Còn ${selected.soLuongTon} sản phẩm` : 'Hết hàng'}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={chuaCo}
              className="flex items-center gap-2 rounded-lg border border-primary px-5 py-3 font-semibold text-primary transition hover:bg-primary-50"
            >
              <ShoppingCart className="h-5 w-5" /> Thêm vào giỏ
            </button>
            <button
              type="button"
              onClick={chuaCo}
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-dark"
            >
              Mua ngay
            </button>
            <button
              type="button"
              onClick={themVaoSoSanh}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-3 text-gray-700 transition hover:bg-gray-50"
            >
              <GitCompare className="h-5 w-5" /> So sánh
            </button>
          </div>
        </div>
      </div>

      {/* Thông số kỹ thuật */}
      {Object.keys(thongSo).length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-xl font-bold text-gray-800">Thông số kỹ thuật</h2>
          <table className="w-full overflow-hidden rounded-lg border border-gray-100 text-sm">
            <tbody>
              {Object.entries(thongSo).map(([k, v], i) => (
                <tr key={k} className={i % 2 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="w-1/3 px-4 py-2.5 font-medium text-gray-600">{nhanThongSo(k)}</td>
                  <td className="px-4 py-2.5 text-gray-800">{String(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <ProductReviews sanPhamId={sp.id} diemTb={sp.diemDanhGiaTb} soLuot={sp.soLuotDanhGia} />
      <RelatedProducts items={sp.sanPhamTuongTu} />
    </Container>
  );
}
