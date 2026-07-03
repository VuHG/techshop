'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
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

  // Mốc = sản phẩm đầu tiên trong danh sách (mảng có thứ tự). Xóa mốc → phần tử kế tự dồn lên làm mốc mới.
  const isEmpty = items.length === 0;
  const mocPhanLoaiId = items[0]?.phanLoaiId;
  // Lượt đầu (chưa có mốc) = chọn bất kỳ; các lượt sau = chỉ SP tương quan cùng phân loại mốc.
  const modalPhanLoaiId = isEmpty ? undefined : mocPhanLoaiId;

  // Nhãn thông số đúng (vd "Ổ cứng") lấy từ filter-schema của phân loại mốc;
  // các SP so sánh luôn cùng phân loại nên 1 schema là đủ. Fallback: prettify mã.
  const { data: schema } = useQuery({
    queryKey: ['filter-schema', mocPhanLoaiId],
    queryFn: () => productService.getFilterSchema(mocPhanLoaiId as number),
    enabled: mocPhanLoaiId != null,
    retry: false,
  });
  const nhan = (k: string): string => {
    const it = schema?.[k] as { label?: string } | undefined;
    return it?.label ?? nhanThongSo(k);
  };

  const products = data ?? [];
  // Sản phẩm không còn thông số chung → gộp thông số từ các biến thể (mỗi key = các giá trị khác nhau).
  const specOf = (p: (typeof products)[number]): Record<string, string> => {
    const acc: Record<string, Set<string>> = {};
    for (const bt of p.bienThes ?? []) {
      for (const [k, v] of Object.entries(bt.thongSoBienThe ?? {})) {
        (acc[k] ??= new Set()).add(String(v));
      }
      if (bt.mauSac) (acc['Màu sắc'] ??= new Set()).add(bt.mauSac);
    }
    const out: Record<string, string> = {};
    for (const [k, s] of Object.entries(acc)) out[k] = Array.from(s).join(', ');
    return out;
  };
  const specMap = new Map(products.map((p) => [p.id, specOf(p)]));
  const keys = Array.from(new Set(products.flatMap((p) => Object.keys(specMap.get(p.id) ?? {}))));
  const rows = keys.filter((k) => {
    if (!chiKhac) return true;
    const vals = products.map((p) => specMap.get(p.id)?.[k] ?? '-');
    return new Set(vals).size > 1;
  });

  return (
    <Container className="py-5">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">So sánh sản phẩm</h1>
        {!isEmpty && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={chiKhac} onChange={(e) => setChiKhac(e.target.checked)} />
            Chỉ hiện điểm khác biệt
          </label>
        )}
      </div>

      {isEmpty ? (
        // Trạng thái rỗng: 3 ô trống có dấu + để khách bấm thêm sản phẩm.
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setMoModal(true)}
              className="flex min-h-[14rem] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-primary hover:text-primary"
            >
              <Plus className="h-8 w-8" />
              <span className="text-sm font-medium">Chọn sản phẩm so sánh</span>
            </button>
          ))}
        </div>
      ) : (
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
                {items.length < 3 && (
                  <th className="p-2 align-top">
                    <button
                      type="button"
                      onClick={() => setMoModal(true)}
                      className="flex min-h-[10rem] w-36 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 text-sm text-gray-400 hover:border-primary hover:text-primary"
                    >
                      <Plus className="h-6 w-6" />
                      Thêm sản phẩm
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((k, i) => (
                <tr key={k} className={i % 2 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2.5 font-medium text-gray-600">{nhan(k)}</td>
                  {products.map((p) => (
                    <td key={p.id} className="px-3 py-2.5 text-center text-gray-800">
                      {specMap.get(p.id)?.[k] ?? '-'}
                    </td>
                  ))}
                  {items.length < 3 && <td />}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {moModal && (
        <CompareModal
          phanLoaiId={modalPhanLoaiId}
          excludeIds={ids}
          onClose={() => setMoModal(false)}
        />
      )}
    </Container>
  );
}
