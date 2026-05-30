'use client';

import Link from 'next/link';
import { X, ChevronRight } from 'lucide-react';
import { DANH_MUC_NAV } from '@/lib/constants';
import { cn } from '@/lib/utils';

/** Menu danh mục dạng trượt cho màn hình nhỏ. */
export function MobileMenu({ mo, onDong }: { mo: boolean; onDong: () => void }) {
  return (
    <>
      {/* Lớp phủ */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/40 transition-opacity lg:hidden',
          mo ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onDong}
      />
      {/* Bảng trượt */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-72 max-w-[80%] bg-white shadow-xl transition-transform lg:hidden',
          mo ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <span className="font-bold text-primary">Danh mục</span>
          <button type="button" aria-label="Đóng" onClick={onDong}>
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <nav className="overflow-y-auto p-2">
          {DANH_MUC_NAV.map((dm) => (
            <Link
              key={dm.id}
              href={`/danh-muc/${dm.id}`}
              onClick={onDong}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary"
            >
              {dm.ten}
              {dm.children && <ChevronRight className="h-4 w-4" />}
            </Link>
          ))}
          <Link
            href="/khuyen-mai"
            onClick={onDong}
            className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-sale"
          >
            Khuyến mãi
          </Link>
        </nav>
      </aside>
    </>
  );
}
