'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ShoppingCart, GitCompare } from 'lucide-react';
import { productService } from '@/services/productService';
import { cartService } from '@/services/cartService';
import { useCompareStore } from '@/stores/compareStore';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
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
  const router = useRouter();
  const qc = useQueryClient();
  const themSoSanh = useCompareStore((s) => s.them);
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const setSoLuong = useCartStore((s) => s.setSoLuong);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [dangThem, setDangThem] = useState(false);

  // Chọn sẵn biến thể theo ?bienThe trên URL (khi tới từ card biến thể / flash sale).
  useEffect(() => {
    const bt = new URLSearchParams(window.location.search).get('bienThe');
    if (bt) setVariantId(Number(bt));
  }, []);

  // Khung trang hiện ngay (load từng phần) — người dùng thấy bố cục thay vì màn hình trống/đơ.
  if (isLoading) {
    return (
      <Container className="py-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-xl bg-gray-100" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-100" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-gray-100" />
            <div className="h-20 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-10 w-2/3 animate-pulse rounded bg-gray-100" />
            <div className="flex gap-3">
              <div className="h-12 w-40 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-12 w-40 animate-pulse rounded-lg bg-gray-100" />
            </div>
          </div>
        </div>
      </Container>
    );
  }
  if (isError || !sp) {
    return <Container className="py-16 text-center text-gray-500">Không tải được sản phẩm.</Container>;
  }

  const bienThes = sp.bienThes;
  const selected = bienThes.find((b) => b.id === variantId) ?? bienThes[0];
  const hetHang = !selected || selected.soLuongTon <= 0 || selected.trangThai === 'HET_HANG';
  const gia = selected ? giaBienThe(selected) : null;
  const giaGoc = selected && selected.giaKhuyenMai != null ? selected.gia : null;
  // Sản phẩm không còn thông số chung → bảng thông số = thông số của biến thể đang chọn + màu.
  const thongSo: Record<string, unknown> = {
    ...(selected?.thongSoBienThe ?? {}),
    ...(selected?.mauSac ? { 'Màu sắc': selected.mauSac } : {}),
  };

  const themVaoSoSanh = () => {
    const card: SanPhamCard = {
      id: sp.id,
      phanLoaiId: sp.phanLoaiId,
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
    const kq = themSoSanh(card);
    if (kq === 'ok') toast.success('Đã thêm vào danh sách so sánh');
    else if (kq === 'trung') toast.error('Sản phẩm đã có trong danh sách so sánh');
    else if (kq === 'day') toast.error('Chỉ so sánh tối đa 3 sản phẩm');
    else toast.error('Chỉ so sánh được sản phẩm tương quan (cùng loại với sản phẩm đầu tiên)');
  };

  const themGio = async (muaNgay: boolean) => {
    if (!selected) return;
    if (!isAuth) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      router.push('/dang-nhap');
      return;
    }
    if (selected.soLuongTon <= 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }
    setDangThem(true);
    try {
      const gio = await cartService.themVaoGio(selected.id, 1);
      setSoLuong(gio.tongSoLuong);
      qc.setQueryData(['gio-hang'], gio); // đồng bộ cache trang giỏ
      if (muaNgay) router.push('/gio-hang');
      else toast.success('Đã thêm vào giỏ hàng');
    } catch {
      /* interceptor toast */
    } finally {
      setDangThem(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="relative">
          <div className={hetHang ? 'opacity-60' : ''}>
            <ProductGallery images={selected?.anhs ?? []} alt={sp.tenSanPham} />
          </div>
          {hetHang && (
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-sale/90 px-4 py-2 text-base font-bold text-white shadow">
              Sản phẩm đang hết
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">{sp.tenSanPham}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <StarRating diem={sp.diemDanhGiaTb ?? 0} />
            <span>
              {(sp.diemDanhGiaTb ?? 0).toFixed(1)} · {sp.soLuotDanhGia ?? 0} đánh giá · Đã bán{' '}
              {sp.soLuotBan ?? 0}
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3 rounded-lg bg-gray-50 p-4">
            <span className="text-3xl font-bold text-sale">
              {gia != null ? formatPrice(gia) : 'Liên hệ'}
            </span>
            {giaGoc && <span className="text-gray-400 line-through">{formatPrice(giaGoc)}</span>}
          </div>

          {Object.keys(sp.banDoBienThe ?? {}).length > 0 && (
            <div className="mt-4">
              <VariantSelector
                banDoBienThe={sp.banDoBienThe}
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
              onClick={() => themGio(false)}
              disabled={dangThem || hetHang}
              className="flex items-center gap-2 rounded-lg border border-primary px-5 py-3 font-semibold text-primary transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingCart className="h-5 w-5" /> Thêm vào giỏ
            </button>
            <button
              type="button"
              onClick={() => themGio(true)}
              disabled={dangThem || hetHang}
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {hetHang ? 'Hết hàng' : 'Mua ngay'}
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
