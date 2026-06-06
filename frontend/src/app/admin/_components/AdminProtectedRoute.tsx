'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

/** Bọc khu vực admin: yêu cầu đăng nhập + vai trò ADMIN. Non-admin → đẩy về trang chủ. */
export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const vaiTro = useAuthStore((s) => s.user?.vaiTro);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuth) router.replace('/dang-nhap');
    else if (vaiTro !== 'ADMIN') router.replace('/');
  }, [mounted, isAuth, vaiTro, router]);

  if (!mounted || !isAuth || vaiTro !== 'ADMIN') {
    return <div className="py-20 text-center text-gray-400">Đang tải...</div>;
  }
  return <>{children}</>;
}
