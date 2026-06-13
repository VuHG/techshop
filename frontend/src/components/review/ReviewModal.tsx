'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { X, CheckCircle2, ImagePlus, Video, Trash2 } from 'lucide-react';
import { reviewService } from '@/services/reviewService';
import { StarInput } from '@/components/ui/StarInput';
import { ProductImage } from '@/components/ui/ProductImage';
import type { ChiTietDonHang, ReviewMedia } from '@/types';

const MAX_MEDIA = 9;

interface ItemState {
  diem: number;
  noiDung: string;
  media: ReviewMedia[];
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
    items.map(() => ({ diem: 5, noiDung: '', media: [], dangGui: false, daGui: false })),
  );

  const update = (i: number, patch: Partial<ItemState>) =>
    setState((s) => s.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const themMedia = (i: number, loaiMedia: ReviewMedia['loaiMedia']) =>
    setState((s) =>
      s.map((it, idx) =>
        idx === i && it.media.length < MAX_MEDIA
          ? { ...it, media: [...it.media, { urlMedia: '', loaiMedia }] }
          : it,
      ),
    );
  const suaMedia = (i: number, j: number, urlMedia: string) =>
    setState((s) =>
      s.map((it, idx) =>
        idx === i ? { ...it, media: it.media.map((m, k) => (k === j ? { ...m, urlMedia } : m)) } : it,
      ),
    );
  const xoaMedia = (i: number, j: number) =>
    setState((s) =>
      s.map((it, idx) => (idx === i ? { ...it, media: it.media.filter((_, k) => k !== j) } : it)),
    );

  const gui = async (i: number) => {
    const st = state[i];
    if (st.diem < 1) {
      toast.error('Vui lòng chọn số sao');
      return;
    }
    const media = st.media.filter((m) => m.urlMedia.trim()).map((m) => ({ ...m, urlMedia: m.urlMedia.trim() }));
    update(i, { dangGui: true });
    try {
      await reviewService.taoDanhGia({
        donHangId,
        bienTheId: items[i].bienTheId,
        diem: st.diem,
        noiDung: st.noiDung.trim() || undefined,
        media: media.length ? media : undefined,
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

                  {/* Ảnh / video minh họa (dán URL, có thể thêm nhiều) */}
                  {state[i].media.map((m, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <span className="shrink-0 rounded bg-gray-100 px-2 py-1 text-[11px] text-gray-600">
                        {m.loaiMedia === 'VIDEO' ? 'Video' : 'Ảnh'}
                      </span>
                      <input
                        value={m.urlMedia}
                        onChange={(e) => suaMedia(i, j, e.target.value)}
                        placeholder={m.loaiMedia === 'VIDEO' ? 'URL video (mp4/webm...)' : 'URL ảnh'}
                        className="min-w-0 flex-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none"
                      />
                      <button type="button" aria-label="Xóa" onClick={() => xoaMedia(i, j)} className="shrink-0 text-gray-400 hover:text-sale">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => themMedia(i, 'HINH_ANH')}
                      disabled={state[i].media.length >= MAX_MEDIA}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-40"
                    >
                      <ImagePlus className="h-4 w-4" /> Thêm ảnh
                    </button>
                    <button
                      type="button"
                      onClick={() => themMedia(i, 'VIDEO')}
                      disabled={state[i].media.length >= MAX_MEDIA}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-40"
                    >
                      <Video className="h-4 w-4" /> Thêm video
                    </button>
                  </div>

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
