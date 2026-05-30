'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number; // 0-based
  totalPages: number;
  onChange: (page: number) => void;
}

/** Tạo danh sách trang hiển thị (0-based) với dấu "..." khi nhiều trang. */
function buildPages(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages: (number | '...')[] = [0];
  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);
  if (start > 1) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 2) pages.push('...');
  pages.push(total - 1);
  return pages;
}

export function Pagination({ currentPage, totalPages, onChange }: PaginationProps) {
  const pages = buildPages(currentPage, totalPages);

  return (
    <nav className="mt-8 flex items-center justify-center gap-1">
      <button
        type="button"
        aria-label="Trang trước"
        disabled={currentPage === 0}
        onClick={() => onChange(currentPage - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e-${i}`} className="px-2 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={cn(
              'h-9 min-w-9 rounded-lg border px-2 text-sm transition',
              p === currentPage
                ? 'border-primary bg-primary text-white'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50',
            )}
          >
            {p + 1}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Trang sau"
        disabled={currentPage >= totalPages - 1}
        onClick={() => onChange(currentPage + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
