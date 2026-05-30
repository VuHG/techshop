'use client';

import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { productService } from '@/services/productService';
import { useCompareStore } from '@/stores/compareStore';
import { ProductImage } from '@/components/ui/ProductImage';
import { formatPrice } from '@/lib/utils';
import type { SanPhamCard } from '@/types';

export function CompareModal({
  phanLoaiId,
  excludeIds,
  onClose,
}: {
  phanLoaiId: number;
  excludeIds: number[];
  onClose: () => void;
}) {
  const them = useCompareStore((s) => s.them);
  const { data } = useQuery({
    queryKey: ['ung-cu-so-sanh', phanLoaiId, excludeIds],
    queryFn: () => productService.getUngCuSoSanh(phanLoaiId, excludeIds),
  });
  const list = data ?? [];

  const chon = (sp: SanPhamCard) => {
    const ok = them(sp);
    if (ok) {
      toast.success('Đã thêm vào so sánh');
      onClose();
    } else {
      toast.error('Đã đủ 3 sản phẩm hoặc đã có trong danh sách');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Thêm sản phẩm so sánh</h3>
          <button type="button" aria-label="Đóng" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {list.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">Không có sản phẩm cùng loại để thêm.</p>
          ) : (
            list.map((sp) => (
              <div key={sp.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-2">
                <ProductImage src={sp.anhChinh} alt={sp.tenSanPham} className="h-12 w-12 shrink-0 rounded" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-gray-700">{sp.tenSanPham}</p>
                  <p className="text-sm font-semibold text-sale">
                    {sp.giaThap != null ? formatPrice(sp.giaThap) : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => chon(sp)}
                  className="shrink-0 rounded bg-primary px-3 py-1.5 text-sm text-white transition hover:bg-primary-dark"
                >
                  Chọn
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
