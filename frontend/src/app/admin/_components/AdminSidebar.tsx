'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Ticket,
  Users,
  SlidersHorizontal,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
  { href: '/admin/don-hang', label: 'Đơn hàng', icon: ShoppingCart },
  { href: '/admin/san-pham', label: 'Sản phẩm', icon: Package },
  { href: '/admin/thuoc-tinh', label: 'Thuộc tính', icon: SlidersHorizontal },
  { href: '/admin/danh-muc', label: 'Danh mục', icon: FolderTree },
  { href: '/admin/ma-giam-gia', label: 'Mã giảm giá', icon: Ticket },
  { href: '/admin/nguoi-dung', label: 'Người dùng', icon: Users },
];

export function AdminSidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const dangXuat = () => {
    logout();
    router.replace('/dang-nhap');
  };

  return (
    <aside className={cn('flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white print:hidden', className)}>
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-5">
        <span className="text-xl font-bold text-primary">TechAdmin</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                active
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <div className="mb-2 px-2">
          <p className="truncate text-sm font-semibold text-gray-900">{user?.hoTen}</p>
          <p className="truncate text-xs text-gray-500">{user?.soDienThoai}</p>
        </div>
        <button
          onClick={dangXuat}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-5 w-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
