'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  User,
  MapPin,
  ShoppingBag,
  MessageSquare,
  Star,
  Bell,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { ACCOUNT_MENU } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { authService } from '@/services/authService';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = { User, MapPin, ShoppingBag, MessageSquare, Star, Bell };

function chuCaiDau(ten?: string | null): string {
  if (!ten) return 'U';
  const parts = ten.trim().split(/\s+/);
  return (parts[parts.length - 1][0] ?? 'U').toUpperCase();
}

export function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const resetCart = useCartStore((s) => s.reset);

  const dangXuat = async () => {
    try {
      await authService.dangXuat();
    } catch {
      /* */
    }
    logout();
    resetCart();
    router.push('/');
  };

  return (
    <aside className="h-fit rounded-xl border border-gray-100 bg-white p-2">
      <div className="flex items-center gap-3 border-b border-gray-100 p-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-bold text-primary">
          {chuCaiDau(user?.hoTen)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-800">{user?.hoTen ?? 'Tài khoản'}</p>
          <p className="text-xs text-gray-400">Khách hàng</p>
        </div>
      </div>
      <nav className="py-1">
        {ACCOUNT_MENU.map((m) => {
          const Icon = ICONS[m.icon];
          const active = pathname === m.href;
          return (
            <Link
              key={m.id}
              href={m.href}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                active ? 'bg-primary-50 font-medium text-primary' : 'text-gray-700 hover:bg-gray-50',
              )}
            >
              <Icon className="h-4 w-4" /> {m.ten}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={dangXuat}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sale hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4" /> Đăng xuất
        </button>
      </nav>
    </aside>
  );
}
