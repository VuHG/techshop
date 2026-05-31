import { api } from '@/lib/api';
import type { ApiResponse, FlashSaleItem } from '@/types';

export const flashSaleService = {
  /** Danh sách flash sale đang diễn ra (public, không cần JWT). */
  async getDangDienRa(): Promise<FlashSaleItem[]> {
    const res = await api.get<ApiResponse<FlashSaleItem[]>>('/flash-sale');
    return res.data.data;
  },
};
