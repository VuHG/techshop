import { api } from '@/lib/api';
import type { ApiResponse, DanhGia, PageResult } from '@/types';

export interface TaoDanhGiaPayload {
  donHangId: number;
  bienTheId: number;
  diem: number;
  noiDung?: string;
}

export const reviewService = {
  /** Đánh giá của 1 sản phẩm (public). */
  async getTheoSanPham(sanPhamId: number, page = 0, size = 20): Promise<PageResult<DanhGia>> {
    const res = await api.get<ApiResponse<PageResult<DanhGia>>>(
      `/san-pham/${sanPhamId}/danh-gia`,
      { params: { page, size } },
    );
    return res.data.data;
  },

  /** Gửi đánh giá (chỉ đơn HOAN_THANH). */
  async taoDanhGia(payload: TaoDanhGiaPayload): Promise<DanhGia> {
    const res = await api.post<ApiResponse<DanhGia>>('/danh-gia', payload);
    return res.data.data;
  },

  /** Lịch sử đánh giá của tôi. */
  async getCuaToi(page = 0, size = 20): Promise<PageResult<DanhGia>> {
    const res = await api.get<ApiResponse<PageResult<DanhGia>>>('/danh-gia/cua-toi', {
      params: { page, size },
    });
    return res.data.data;
  },
};
