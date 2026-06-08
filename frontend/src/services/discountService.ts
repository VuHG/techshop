import { api } from '@/lib/api';
import type { ApiResponse, DiscountResult } from '@/types';

export interface DongApMa {
  sanPhamId: number;
  bienTheId: number;
  thanhTien: number;
}

export const discountService = {
  /** Xem trước số tiền được giảm trước khi checkout. */
  async apDung(maCode: string, items: DongApMa[]): Promise<DiscountResult> {
    const res = await api.post<ApiResponse<DiscountResult>>('/ma-giam-gia/ap-dung', {
      maCode,
      items,
    });
    return res.data.data;
  },
};
