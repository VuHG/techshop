import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Phase 7: chỉ giữ số lượng để hiện badge giỏ hàng. Logic chi tiết ở Phase 9.
interface CartState {
  soLuong: number;
  setSoLuong: (n: number) => void;
  reset: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      soLuong: 0,
      setSoLuong: (n) => set({ soLuong: n }),
      reset: () => set({ soLuong: 0 }),
    }),
    { name: 'techshop-cart' },
  ),
);
