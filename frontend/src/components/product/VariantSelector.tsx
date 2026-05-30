'use client';

import { cn } from '@/lib/utils';
import type { BienThe } from '@/types';

function moTaBienThe(bt: BienThe): string {
  const vals = Object.values(bt.thongSoBienThe).map(String);
  return vals.length ? vals.join(' / ') : bt.maBienThe;
}

export function VariantSelector({
  bienThes,
  selectedId,
  onSelect,
}: {
  bienThes: BienThe[];
  selectedId: number;
  onSelect: (id: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {bienThes.map((bt) => {
        const hetHang = bt.soLuongTon <= 0;
        return (
          <button
            key={bt.id}
            type="button"
            disabled={hetHang}
            onClick={() => onSelect(bt.id)}
            className={cn(
              'rounded-lg border px-3 py-2 text-sm transition',
              bt.id === selectedId
                ? 'border-primary bg-primary-50 text-primary'
                : 'border-gray-300 text-gray-700 hover:border-primary',
              hetHang && 'cursor-not-allowed line-through opacity-40',
            )}
          >
            {moTaBienThe(bt)}
          </button>
        );
      })}
    </div>
  );
}
