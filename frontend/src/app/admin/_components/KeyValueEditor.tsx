'use client';

import { Plus, X } from 'lucide-react';

export interface KV {
  key: string;
  value: string;
}

/** Bộ nhập thông số dạng key-value động (→ JSONB). */
export function KeyValueEditor({
  rows,
  onChange,
  keyPlaceholder = 'Tên thông số (vd: ram)',
  valuePlaceholder = 'Giá trị (vd: 16GB)',
}: {
  rows: KV[];
  onChange: (rows: KV[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}) {
  const sua = (i: number, patch: Partial<KV>) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const xoa = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const them = () => onChange([...rows, { key: '', value: '' }]);

  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={r.key}
            onChange={(e) => sua(i, { key: e.target.value })}
            placeholder={keyPlaceholder}
            className="w-1/3 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            value={r.value}
            onChange={(e) => sua(i, { value: e.target.value })}
            placeholder={valuePlaceholder}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => xoa(i)}
            className="shrink-0 rounded-lg border border-gray-300 px-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
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
        <Plus className="h-4 w-4" /> Thêm thông số
      </button>
    </div>
  );
}

/** Chuyển mảng KV → object (bỏ dòng trống). */
export function kvToObject(rows: KV[]): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const r of rows) {
    const k = r.key.trim();
    if (k) obj[k] = r.value.trim();
  }
  return obj;
}

/** Chuyển object → mảng KV cho form. */
export function objectToKv(obj: Record<string, unknown> | null | undefined): KV[] {
  if (!obj) return [];
  return Object.entries(obj).map(([key, value]) => ({ key, value: String(value ?? '') }));
}
