import { api } from '@/lib/api';
import type { ApiResponse, DonHang, DonHangSummary, PageResult } from '@/types';

export interface DatHangPayload {
  hoTenNguoiNhan: string;
  soDienThoaiNhan: string;
  diaChiGiaoHang: string;
  gioHangIds: number[];
  maGiamGia?: string;
  ghiChu?: string;
}

export const orderService = {
  async datHang(payload: DatHangPayload): Promise<DonHang> {
    const res = await api.post<ApiResponse<DonHang>>('/don-hang', payload);
    return res.data.data;
  },

  async getDanhSach(trangThai?: string, page = 0, size = 20): Promise<PageResult<DonHangSummary>> {
    const res = await api.get<ApiResponse<PageResult<DonHangSummary>>>('/don-hang', {
      params: { trangThai: trangThai || undefined, page, size },
    });
    return res.data.data;
  },

  async getChiTiet(maDonHang: string): Promise<DonHang> {
    const res = await api.get<ApiResponse<DonHang>>(`/don-hang/${maDonHang}`);
    return res.data.data;
  },

  async huyDon(id: number): Promise<DonHang> {
    const res = await api.patch<ApiResponse<DonHang>>(`/don-hang/${id}/huy`);
    return res.data.data;
  },

  async xacNhan(id: number): Promise<DonHang> {
    const res = await api.patch<ApiResponse<DonHang>>(`/don-hang/${id}/xac-nhan`);
    return res.data.data;
  },
};
