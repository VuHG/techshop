import { create } from 'zustand';

// Lưu lựa chọn từ giỏ hàng để chuyển sang trang thanh toán (Phase 9B).
interface CheckoutState {
  gioHangIds: number[];
  maGiamGia: string | null;
  set: (gioHangIds: number[], maGiamGia: string | null) => void;
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  gioHangIds: [],
  maGiamGia: null,
  set: (gioHangIds, maGiamGia) => set({ gioHangIds, maGiamGia }),
  reset: () => set({ gioHangIds: [], maGiamGia: null }),
}));
