'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

/** Bọc các trang yêu cầu đăng nhập (/gio-hang, /thanh-toan, /tai-khoan...). */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !isAuth) router.replace('/dang-nhap');
  }, [mounted, isAuth, router]);

  if (!mounted || !isAuth) {
    return <div className="py-20 text-center text-gray-400">Đang tải...</div>;
  }
  return <>{children}</>;
}
