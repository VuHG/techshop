import { api } from '@/lib/api';
import type { ApiResponse, DanhGia, PageResult } from '@/types';

export const reviewService = {
  /** Đánh giá của 1 sản phẩm (public). */
  async getTheoSanPham(sanPhamId: number, page = 0, size = 20): Promise<PageResult<DanhGia>> {
    const res = await api.get<ApiResponse<PageResult<DanhGia>>>(
      `/san-pham/${sanPhamId}/danh-gia`,
      { params: { page, size } },
    );
    return res.data.data;
  },
};
