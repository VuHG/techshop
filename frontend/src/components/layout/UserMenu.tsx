'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ChevronDown,
  LogOut,
  MapPin,
  ShoppingBag,
  MessageSquare,
  Star,
  Bell,
  type LucideIcon,
} from 'lucide-react';
import { ACCOUNT_MENU } from '@/lib/constants';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { authService } from '@/services/authService';

const ICONS: Record<string, LucideIcon> = { User, MapPin, ShoppingBag, MessageSquare, Star, Bell };

export function UserMenu() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const resetCart = useCartStore((s) => s.reset);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const dangXuat = async () => {
    setOpen(false);
    try {
      await authService.dangXuat();
    } catch {
      /* vẫn đăng xuất ở client dù API lỗi */
    }
    logout();
    resetCart();
    router.push('/');
  };

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-primary"
      >
        <User className="h-5 w-5" />
        <span className="hidden max-w-[8rem] truncate sm:inline">{user?.hoTen ?? 'Tài khoản'}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
          {ACCOUNT_MENU.map((m) => {
            const Icon = ICONS[m.icon];
            return (
              <Link
                key={m.id}
                href={m.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary"
              >
                <Icon className="h-4 w-4" /> {m.ten}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={dangXuat}
            className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-2 text-sm text-sale hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
