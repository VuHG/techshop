import { api } from '@/lib/api';
import type { ApiResponse, DiscountResult } from '@/types';

export const discountService = {
  /** Xem trước số tiền được giảm trước khi checkout. */
  async apDung(maCode: string, tongTienHang: number, sanPhamIds: number[]): Promise<DiscountResult> {
    const res = await api.post<ApiResponse<DiscountResult>>('/ma-giam-gia/ap-dung', {
      maCode,
      tongTienHang,
      sanPhamIds,
    });
    return res.data.data;
  },
};
