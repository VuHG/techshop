'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { productService } from '@/services/productService';
import { cn } from '@/lib/utils';

// Class dùng CHUNG cho mục danh mục cha và con → font/màu giống hệt nhau.
const MUC_CLASS = 'flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary';

export function CategoryMenu() {
  const [moPanel, setMoPanel] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);

  // Lấy cây danh mục động từ DB (GET /api/danh-muc).
  const { data: danhMucList } = useQuery({
    queryKey: ['cay-danh-muc'],
    queryFn: productService.getCayDanhMuc,
    staleTime: 5 * 60 * 1000,
  });

  const list = danhMucList ?? [];
  const active = list.find((d) => d.id === activeId) ?? list[0];
  const activeCon = active?.danhMucCon ?? [];

  return (
    <div
      className="relative"
      onMouseEnter={() => setMoPanel(true)}
      onMouseLeave={() => setMoPanel(false)}
    >
      <button
        type="button"
        className="flex items-center gap-1 whitespace-nowrap py-2 text-sm font-medium text-gray-700 hover:text-primary"
      >
        Danh mục
        <ChevronDown className="h-4 w-4" />
      </button>

      {moPanel && list.length > 0 && (
        <div className="absolute left-0 top-full z-50 flex animate-fade-in rounded-lg border border-gray-100 bg-white shadow-xl">
          {/* Cột danh mục cha */}
          <ul className="w-56 py-2">
            {list.map((dm) => {
              const coCon = dm.danhMucCon && dm.danhMucCon.length > 0;
              return (
                <li key={dm.id}>
                  <Link
                    href={`/danh-muc/${dm.slug}`}
                    onMouseEnter={() => setActiveId(dm.id)}
                    className={cn(MUC_CLASS, coCon && active?.id === dm.id && 'bg-primary-50 text-primary')}
                  >
                    {dm.tenDanhMuc}
                    {coCon && <ChevronRight className="h-4 w-4" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Panel danh mục con — font/màu GIỐNG HỆT danh mục cha (cùng MUC_CLASS) */}
          {activeCon.length > 0 && (
            <ul className="w-64 border-l border-gray-100 py-2">
              {activeCon.map((con) => (
                <li key={con.id}>
                  <Link href={`/danh-muc/${con.slug}`} className={MUC_CLASS}>
                    {con.tenDanhMuc}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
