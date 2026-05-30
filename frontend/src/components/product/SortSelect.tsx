'use client';

import { SORT_OPTIONS } from '@/lib/constants';

export type SortValue = 'newest' | 'rating' | 'sold';

export function SortSelect({
  value,
  onChange,
}: {
  value: SortValue;
  onChange: (v: SortValue) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortValue)}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
