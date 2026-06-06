'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Phân trang đơn giản (0-based) cho admin. */
export function AdminPagination({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <div className="mt-4 flex items-center justify-center gap-1">
      <button
        disabled={currentPage === 0}
        onClick={() => onChange(currentPage - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-100"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            'h-9 min-w-9 rounded-lg border px-3 text-sm font-medium',
            p === currentPage
              ? 'border-primary bg-primary text-white'
              : 'border-gray-200 text-gray-600 hover:bg-gray-100',
          )}
        >
          {p + 1}
        </button>
      ))}
      <button
        disabled={currentPage >= totalPages - 1}
        onClick={() => onChange(currentPage + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-100"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
