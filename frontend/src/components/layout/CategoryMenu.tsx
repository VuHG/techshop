'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { DANH_MUC_NAV } from '@/lib/constants';
import type { DanhMucNav } from '@/types';
import { cn } from '@/lib/utils';

export function CategoryMenu() {
  const [moPanel, setMoPanel] = useState(false);
  const [activeId, setActiveId] = useState<string>(DANH_MUC_NAV[0].id);

  const active = DANH_MUC_NAV.find((d) => d.id === activeId);

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

      {moPanel && (
        <div className="absolute left-0 top-full z-50 flex animate-fade-in rounded-lg border border-gray-100 bg-white shadow-xl">
          {/* Cột cấp 1 */}
          <ul className="w-52 py-2">
            {DANH_MUC_NAV.map((dm) => (
              <li key={dm.id}>
                <Link
                  href={`/danh-muc/${dm.id}`}
                  onMouseEnter={() => setActiveId(dm.id)}
                  className={cn(
                    'flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary',
                    activeId === dm.id && 'bg-primary-50 text-primary',
                  )}
                >
                  {dm.ten}
                  {dm.children && <ChevronRight className="h-4 w-4" />}
                </Link>
              </li>
            ))}
          </ul>

          {/* Panel con cấp 2/3 */}
          {active?.children && (
            <div className="w-72 border-l border-gray-100 p-4">
              {active.children.map((con) => (
                <PanelCon key={con.id} muc={con} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PanelCon({ muc }: { muc: DanhMucNav }) {
  return (
    <div className="mb-4 last:mb-0">
      <Link
        href={`/danh-muc/${muc.id}`}
        className="mb-2 block text-sm font-semibold uppercase text-sale"
      >
        {muc.ten}
      </Link>
      {muc.children && (
        <ul className="grid grid-cols-1 gap-1">
          {muc.children.map((g) => (
            <li key={g.id}>
              <Link
                href={`/danh-muc/${g.id}`}
                className="block py-1 text-sm text-gray-600 hover:text-primary"
              >
                {g.ten}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
