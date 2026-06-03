'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search, X } from 'lucide-react';
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
  /** undefined = lượt chọn đầu tiên (toàn bộ cửa hàng); có giá trị = chỉ SP tương quan cùng phân loại mốc. */
  phanLoaiId?: number;
  excludeIds: number[];
  onClose: () => void;
}) {
  const them = useCompareStore((s) => s.them);
  const laLuotDau = phanLoaiId === undefined;

  // Ô tìm kiếm + debounce 300ms để không gọi API mỗi ký tự.
  const [tuKhoa, setTuKhoa] = useState('');
  const [tuKhoaDebounced, setTuKhoaDebounced] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setTuKhoaDebounced(tuKhoa), 300);
    return () => clearTimeout(t);
  }, [tuKhoa]);

  const { data, isLoading } = useQuery({
    queryKey: ['ung-cu-so-sanh', phanLoaiId, excludeIds, tuKhoaDebounced],
    queryFn: () => productService.getUngCuSoSanh(phanLoaiId, excludeIds, tuKhoaDebounced),
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
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">
            {laLuotDau ? 'Chọn sản phẩm so sánh' : 'Chọn sản phẩm tương quan'}
          </h3>
          <button type="button" aria-label="Đóng" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <p className="mb-3 text-xs text-gray-500">
          {laLuotDau
            ? 'Chọn bất kỳ sản phẩm nào trong cửa hàng làm mốc so sánh.'
            : 'Chỉ hiển thị sản phẩm cùng loại với sản phẩm mốc.'}
        </p>

        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder="Tìm theo tên sản phẩm..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div className="max-h-80 space-y-2 overflow-y-auto">
          {isLoading ? (
            <p className="py-6 text-center text-sm text-gray-400">Đang tải...</p>
          ) : list.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              {laLuotDau
                ? 'Không tìm thấy sản phẩm phù hợp.'
                : 'Không có sản phẩm tương quan để thêm.'}
            </p>
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
