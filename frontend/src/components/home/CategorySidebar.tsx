import Link from 'next/link';
import { Laptop, Monitor, Cpu, Mouse, Recycle, type LucideIcon } from 'lucide-react';
import { DANH_MUC_SIDEBAR } from '@/lib/constants';

const ICONS: Record<string, LucideIcon> = { Laptop, Monitor, Cpu, Mouse, Recycle };

/** Danh mục nhanh (icon tròn) — cột trái trang chủ. */
export function CategorySidebar() {
  return (
    <aside className="hidden w-56 shrink-0 rounded-xl border border-gray-100 bg-white p-4 lg:block">
      <h3 className="mb-4 text-center text-lg font-bold text-gray-800">Danh mục</h3>
      <ul className="space-y-3">
        {DANH_MUC_SIDEBAR.map((dm) => {
          const Icon = ICONS[dm.icon];
          return (
            <li key={dm.id}>
              <Link
                href={`/danh-muc/${dm.id}`}
                className="flex flex-col items-center gap-1.5 rounded-lg py-2 text-sm text-gray-700 transition hover:text-primary"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50">
                  <Icon className="h-6 w-6 text-primary" />
                </span>
                {dm.ten}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
