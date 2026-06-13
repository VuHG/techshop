import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NguoiDung } from '@/types';
import { useCompareStore } from './compareStore';
import { useCartStore } from './cartStore';
import { useCheckoutStore } from './checkoutStore';

// Xóa toàn bộ dữ liệu gắn với người dùng (tránh dữ liệu tài khoản cũ dính sang tài khoản mới).
function xoaDuLieuNguoiDung() {
  useCompareStore.getState().xoaTatCa();
  useCartStore.getState().reset();
  useCheckoutStore.getState().reset();
}

interface AuthState {
  user: NguoiDung | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: NguoiDung, accessToken: string, refreshToken: string) => void;
  setUser: (user: NguoiDung) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) => {
        // Đăng nhập (kể cả đổi sang tài khoản khác) → bỏ dữ liệu của phiên trước.
        xoaDuLieuNguoiDung();
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },
      setUser: (user) => set({ user }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      logout: () => {
        xoaDuLieuNguoiDung();
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    { name: 'techshop-auth' },
  ),
);
