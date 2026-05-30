'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { X, CheckCircle2 } from 'lucide-react';
import { reviewService } from '@/services/reviewService';
import { StarInput } from '@/components/ui/StarInput';
import { ProductImage } from '@/components/ui/ProductImage';
import type { ChiTietDonHang } from '@/types';

interface ItemState {
  diem: number;
  noiDung: string;
  dangGui: boolean;
  daGui: boolean;
}

export function ReviewModal({
  donHangId,
  items,
  onClose,
}: {
  donHangId: number;
  items: ChiTietDonHang[];
  onClose: () => void;
}) {
  const [state, setState] = useState<ItemState[]>(
    items.map(() => ({ diem: 5, noiDung: '', dangGui: false, daGui: false })),
  );

  const update = (i: number, patch: Partial<ItemState>) =>
    setState((s) => s.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const gui = async (i: number) => {
    const st = state[i];
    if (st.diem < 1) {
      toast.error('Vui lòng chọn số sao');
      return;
    }
    update(i, { dangGui: true });
    try {
      await reviewService.taoDanhGia({
        donHangId,
        bienTheId: items[i].bienTheId,
        diem: st.diem,
        noiDung: st.noiDung.trim() || undefined,
      });
      update(i, { daGui: true, dangGui: false });
      toast.success('Cảm ơn bạn đã đánh giá');
    } catch {
      update(i, { dangGui: false });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Đánh giá sản phẩm</h3>
          <button type="button" aria-label="Đóng" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="rounded-lg border border-gray-100 p-3">
              <div className="flex gap-3">
                <ProductImage src={item.duongDanAnhChinh} alt={item.tenSanPham} className="h-12 w-12 shrink-0 rounded" />
                <p className="flex-1 text-sm font-medium text-gray-800">{item.tenSanPham}</p>
              </div>

              {state[i].daGui ? (
                <p className="mt-3 flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" /> Đã gửi đánh giá
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  <StarInput value={state[i].diem} onChange={(v) => update(i, { diem: v })} />
                  <textarea
                    value={state[i].noiDung}
                    onChange={(e) => update(i, { noiDung: e.target.value })}
                    placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                    rows={2}
                    maxLength={2000}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => gui(i)}
                    disabled={state[i].dangGui}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                  >
                    {state[i].dangGui ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
