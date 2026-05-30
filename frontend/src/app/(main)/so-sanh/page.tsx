'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { productService } from '@/services/productService';
import { useCompareStore } from '@/stores/compareStore';
import { Container } from '@/components/ui/Container';
import { ProductImage } from '@/components/ui/ProductImage';
import { CompareModal } from '@/components/compare/CompareModal';
import { formatPrice, giaThapNhat, nhanThongSo } from '@/lib/utils';

export default function SoSanhPage() {
  const items = useCompareStore((s) => s.items);
  const xoa = useCompareStore((s) => s.xoa);
  const [chiKhac, setChiKhac] = useState(false);
  const [moModal, setMoModal] = useState(false);

  const ids = items.map((i) => i.id);
  const { data } = useQuery({
    queryKey: ['so-sanh', ids],
    queryFn: () => productService.getSoSanh(ids),
    enabled: ids.length >= 1,
  });

  if (items.length === 0) {
    return (
      <Container className="py-16 text-center text-gray-500">
        Chưa có sản phẩm để so sánh.{' '}
        <Link href="/khuyen-mai" className="text-primary hover:underline">
          Chọn sản phẩm
        </Link>
      </Container>
    );
  }

  const products = data ?? [];
  const keys = Array.from(new Set(products.flatMap((p) => Object.keys(p.thongSoKyThuat))));
  const rows = keys.filter((k) => {
    if (!chiKhac) return true;
    const vals = products.map((p) => String(p.thongSoKyThuat[k] ?? '-'));
    return new Set(vals).size > 1;
  });
  const phanLoaiId = products[0]?.phanLoaiId;

  return (
    <Container className="py-5">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">So sánh sản phẩm</h1>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={chiKhac} onChange={(e) => setChiKhac(e.target.checked)} />
          Chỉ hiện điểm khác biệt
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-40" />
              {products.map((p) => (
                <th key={p.id} className="p-2 align-top">
                  <div className="relative rounded-lg border border-gray-200 p-3">
                    <button
                      type="button"
                      aria-label="Bỏ"
                      onClick={() => xoa(p.id)}
                      className="absolute right-1 top-1"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                    <ProductImage
                      src={p.bienThes?.[0]?.anhs?.[0]?.urlAnh ?? null}
                      alt={p.tenSanPham}
                      className="mx-auto h-24 w-24"
                    />
                    <Link
                      href={`/san-pham/${p.slug}`}
                      className="mt-2 block text-center text-sm font-medium text-gray-800 hover:text-primary"
                    >
                      {p.tenSanPham}
                    </Link>
                    <p className="text-center font-bold text-sale">
                      {(() => {
                        const g = giaThapNhat(p.bienThes);
                        return g != null ? formatPrice(g) : '-';
                      })()}
                    </p>
                  </div>
                </th>
              ))}
              {products.length < 3 && phanLoaiId && (
                <th className="p-2 align-top">
                  <button
                    type="button"
                    onClick={() => setMoModal(true)}
                    className="flex min-h-[10rem] w-36 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-400 hover:border-primary hover:text-primary"
                  >
                    + Thêm sản phẩm
                  </button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((k, i) => (
              <tr key={k} className={i % 2 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2.5 font-medium text-gray-600">{nhanThongSo(k)}</td>
                {products.map((p) => (
                  <td key={p.id} className="px-3 py-2.5 text-center text-gray-800">
                    {String(p.thongSoKyThuat[k] ?? '-')}
                  </td>
                ))}
                {products.length < 3 && phanLoaiId && <td />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {moModal && phanLoaiId && (
        <CompareModal phanLoaiId={phanLoaiId} excludeIds={ids} onClose={() => setMoModal(false)} />
      )}
    </Container>
  );
}
