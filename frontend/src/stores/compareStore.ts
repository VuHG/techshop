import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SanPhamCard } from '@/types';

const MAX_SO_SANH = 3;

interface CompareState {
  items: SanPhamCard[];
  them: (sp: SanPhamCard) => boolean; // false nếu đã đầy hoặc trùng
  xoa: (id: number) => void;
  xoaTatCa: () => void;
  coTrong: (id: number) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      them: (sp) => {
        const { items } = get();
        if (items.length >= MAX_SO_SANH || items.some((i) => i.id === sp.id)) return false;
        set({ items: [...items, sp] });
        return true;
      },
      xoa: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      xoaTatCa: () => set({ items: [] }),
      coTrong: (id) => get().items.some((i) => i.id === id),
    }),
    { name: 'techshop-compare' },
  ),
);

export { MAX_SO_SANH };
