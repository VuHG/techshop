import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SanPhamCard } from '@/types';

const MAX_SO_SANH = 3;

/** Kết quả thêm vào so sánh — để caller hiển thị đúng thông báo. */
export type ThemKetQua = 'ok' | 'day' | 'trung' | 'khac-loai';

interface CompareState {
  items: SanPhamCard[];
  them: (sp: SanPhamCard) => ThemKetQua;
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
        if (items.some((i) => i.id === sp.id)) return 'trung';
        if (items.length >= MAX_SO_SANH) return 'day';
        // Mốc = items[0]. Sản phẩm 2,3 phải tương quan (cùng phân loại) với mốc.
        if (items.length > 0 && items[0].phanLoaiId !== sp.phanLoaiId) return 'khac-loai';
        set({ items: [...items, sp] });
        return 'ok';
      },
      xoa: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      xoaTatCa: () => set({ items: [] }),
      coTrong: (id) => get().items.some((i) => i.id === id),
    }),
    { name: 'techshop-compare' },
  ),
);

export { MAX_SO_SANH };
