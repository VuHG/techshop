'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Plus } from 'lucide-react';
import { useCompareStore, MAX_SO_SANH } from '@/stores/compareStore';
import { ProductImage } from '@/components/ui/ProductImage';
import { Container } from '@/components/ui/Container';
import { CompareModal } from './CompareModal';
import { cn } from '@/lib/utils';

/** Thanh so sánh nổi ở đáy — hiện khi có ≥1 sản phẩm trong danh sách. */
export function CompareBar() {
  const items = useCompareStore((s) => s.items);
  const xoa = useCompareStore((s) => s.xoa);
  const xoaTatCa = useCompareStore((s) => s.xoaTatCa);
  const [mounted, setMounted] = useState(false);
  const [moModal, setMoModal] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || items.length === 0) return null;

  const slots = [...items, ...Array(Math.max(0, MAX_SO_SANH - items.length)).fill(null)];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
      <Container className="flex items-center gap-4 py-3">
        <div className="no-scrollbar flex flex-1 items-center gap-3 overflow-x-auto">
          {slots.map((it, i) =>
            it ? (
              <div
                key={it.id}
                className="relative flex w-36 shrink-0 items-center gap-2 rounded-lg border border-gray-200 p-2"
              >
                <ProductImage src={it.anhChinh} alt={it.tenSanPham} className="h-10 w-10 shrink-0 rounded" />
                <span className="line-clamp-2 text-xs text-gray-700">{it.tenSanPham}</span>
                <button
                  type="button"
                  aria-label="Bỏ"
                  onClick={() => xoa(it.id)}
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-gray-200 p-0.5 hover:bg-gray-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                key={`empty-${i}`}
                type="button"
                onClick={() => setMoModal(true)}
                className="flex h-14 w-36 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400 transition hover:border-primary hover:text-primary"
              >
                <Plus className="h-5 w-5" />
              </button>
            ),
          )}
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-1">
          <Link
            href="/so-sanh"
            className={cn(
              'rounded-lg bg-green-600 px-5 py-2 text-center text-sm font-semibold text-white transition hover:bg-green-700',
              items.length < 2 && 'pointer-events-none opacity-50',
            )}
          >
            So sánh ngay
          </Link>
          <button
            type="button"
            onClick={xoaTatCa}
            className="text-center text-xs text-gray-500 hover:underline"
          >
            Xóa tất cả
          </button>
        </div>
      </Container>

      {/* Mốc = items[0]; modal chỉ hiện sản phẩm tương quan cùng phân loại. */}
      {moModal && (
        <CompareModal
          phanLoaiId={items[0]?.phanLoaiId}
          excludeIds={items.map((i) => i.id)}
          onClose={() => setMoModal(false)}
        />
      )}
    </div>
  );
}
