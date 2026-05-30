'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Code2, Scale, ShoppingCart, User, Menu } from 'lucide-react';
import { CategoryMenu } from './CategoryMenu';
import { MobileMenu } from './MobileMenu';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';
import { NotificationBell } from './NotificationBell';
import { useCompareStore } from '@/stores/compareStore';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { Container } from '@/components/ui/Container';

export function Header() {
  const [moMobile, setMoMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  const soSanh = useCompareStore((s) => s.items.length);
  const soGio = useCartStore((s) => s.soLuong);
  const isAuth = useAuthStore((s) => s.isAuthenticated);

  // Tránh lệch hydration: badge & trạng thái auth chỉ render sau khi mount.
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white">
      <Container className="flex h-16 items-center gap-3">
        {/* Hamburger (mobile) */}
        <button
          type="button"
          aria-label="Mở menu"
          className="lg:hidden"
          onClick={() => setMoMobile(true)}
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-1.5 text-primary">
          <Code2 className="h-7 w-7" />
          <span className="text-xl font-bold">TechShop</span>
        </Link>

        {/* Nav (desktop) */}
        <nav className="hidden items-center gap-4 lg:flex">
          <CategoryMenu />
          <Link
            href="/khuyen-mai"
            className="whitespace-nowrap py-2 text-sm font-medium text-gray-700 hover:text-primary"
          >
            Khuyến mãi
          </Link>
        </nav>

        {/* Search + auto-suggest */}
        <SearchBar />

        {/* So sánh */}
        <Link
          href="/so-sanh"
          aria-label="So sánh"
          className="relative shrink-0 text-gray-700 hover:text-primary"
        >
          <Scale className="h-6 w-6" />
          {mounted && soSanh > 0 && <Badge value={soSanh} />}
        </Link>

        {/* Giỏ hàng */}
        <Link
          href="/gio-hang"
          aria-label="Giỏ hàng"
          className="relative shrink-0 text-gray-700 hover:text-primary"
        >
          <ShoppingCart className="h-6 w-6" />
          {mounted && soGio > 0 && <Badge value={soGio} />}
        </Link>

        {/* Thông báo (chỉ khi đăng nhập) */}
        {mounted && isAuth && <NotificationBell />}

        {/* Auth */}
        {mounted && isAuth ? (
          <UserMenu />
        ) : (
          <Link
            href="/dang-nhap"
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Đăng nhập</span>
          </Link>
        )}
      </Container>

      <MobileMenu mo={moMobile} onDong={() => setMoMobile(false)} />
    </header>
  );
}

function Badge({ value }: { value: number }) {
  return (
    <span className="absolute -right-2 -top-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-sale px-1 text-[11px] font-bold text-white">
      {value}
    </span>
  );
}
