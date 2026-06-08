'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { BienThe, BanDoBienThe } from '@/types';

/**
 * Chọn phiên bản 2 cấp theo san_pham.ban_do_bien_the:
 *   cấp 1 = cấu hình (chuỗi thông số) → cấp 2 = màu → ra id biến thể.
 * Chỉ hiện biến thể CON_HANG; biến thể hết tồn bị vô hiệu (gạch ngang).
 */
export function VariantSelector({
  banDoBienThe,
  bienThes,
  selectedId,
  onSelect,
}: {
  banDoBienThe: BanDoBienThe;
  bienThes: BienThe[];
  selectedId: number;
  onSelect: (id: number) => void;
}) {
  const btById = useMemo(
    () => new Map(bienThes.map((b) => [b.id, b])),
    [bienThes],
  );
  const conHang = (id: number) => btById.get(id)?.trangThai === 'CON_HANG';

  // Lọc bản đồ: chỉ giữ biến thể đang bán & tồn tại trong danh sách trả về.
  const cauHinhs = useMemo(() => {
    const out: { ten: string; mau: { ten: string; id: number }[] }[] = [];
    for (const [spec, colorMap] of Object.entries(banDoBienThe ?? {})) {
      const mau = Object.entries(colorMap)
        .filter(([, id]) => conHang(id))
        .map(([ten, id]) => ({ ten, id }));
      if (mau.length) out.push({ ten: spec || 'Mặc định', mau });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banDoBienThe, bienThes]);

  // Cấu hình + màu đang chọn (suy từ selectedId).
  const cauHinhDangChon =
    cauHinhs.find((c) => c.mau.some((m) => m.id === selectedId)) ?? cauHinhs[0];

  if (cauHinhs.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Cấp 1: cấu hình */}
      <div>
        <p className="mb-2 text-sm font-semibold text-gray-700">Phiên bản</p>
        <div className="flex flex-wrap gap-2">
          {cauHinhs.map((c) => {
            const active = c === cauHinhDangChon;
            return (
              <button
                key={c.ten}
                type="button"
                onClick={() => onSelect(c.mau[0].id)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm transition',
                  active
                    ? 'border-primary bg-primary-50 text-primary'
                    : 'border-gray-300 text-gray-700 hover:border-primary',
                )}
              >
                {c.ten}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cấp 2: màu của cấu hình đang chọn */}
      {cauHinhDangChon && cauHinhDangChon.mau.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-700">Màu sắc</p>
          <div className="flex flex-wrap gap-2">
            {cauHinhDangChon.mau.map((m) => {
              const bt = btById.get(m.id);
              const hetHang = !bt || bt.soLuongTon <= 0;
              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={hetHang}
                  onClick={() => onSelect(m.id)}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-sm transition',
                    m.id === selectedId
                      ? 'border-primary bg-primary-50 text-primary'
                      : 'border-gray-300 text-gray-700 hover:border-primary',
                    hetHang && 'cursor-not-allowed line-through opacity-40',
                  )}
                >
                  {m.ten}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
