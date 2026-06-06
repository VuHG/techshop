'use client';

import { Plus, X } from 'lucide-react';
import { ProductImage } from '@/components/ui/ProductImage';

/** Bộ nhập danh sách URL ảnh (ảnh đầu = ảnh chính). */
export function UrlListEditor({
  urls,
  onChange,
}: {
  urls: string[];
  onChange: (urls: string[]) => void;
}) {
  const sua = (i: number, v: string) => onChange(urls.map((u, idx) => (idx === i ? v : u)));
  const xoa = (i: number) => onChange(urls.filter((_, idx) => idx !== i));
  const them = () => onChange([...urls, '']);

  return (
    <div className="space-y-2">
      {urls.map((u, i) => (
        <div key={i} className="flex items-center gap-2">
          <ProductImage
            src={u || null}
            alt=""
            className="h-10 w-10 shrink-0 rounded border border-gray-200"
          />
          <input
            value={u}
            onChange={(e) => sua(i, e.target.value)}
            placeholder="https://..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {i === 0 && u && (
            <span className="shrink-0 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
              Ảnh chính
            </span>
          )}
          <button
            type="button"
            onClick={() => xoa(i)}
            className="shrink-0 rounded-lg border border-gray-300 px-2 py-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={them}
        className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        <Plus className="h-4 w-4" /> Thêm ảnh (URL)
      </button>
    </div>
  );
}
