import { api } from '@/lib/api';
import type { ApiResponse, DonHang, DonHangSummary, PageResult } from '@/types';

export const adminOrderService = {
  async getDanhSach(
    trangThai?: string,
    search?: string,
    page = 0,
    size = 20,
    tuNgay?: string,
    denNgay?: string,
  ): Promise<PageResult<DonHangSummary>> {
    const res = await api.get<ApiResponse<PageResult<DonHangSummary>>>('/admin/don-hang', {
      params: {
        trangThai: trangThai || undefined,
        search: search || undefined,
        tuNgay: tuNgay || undefined,
        denNgay: denNgay || undefined,
        page,
        size,
      },
    });
    return res.data.data;
  },

  async demTrangThai(): Promise<Record<string, number>> {
    const res = await api.get<ApiResponse<Record<string, number>>>(
      '/admin/don-hang/dem-trang-thai',
    );
    return res.data.data;
  },

  async getChiTiet(id: number): Promise<DonHang> {
    const res = await api.get<ApiResponse<DonHang>>(`/admin/don-hang/${id}`);
    return res.data.data;
  },

  async duyet(id: number): Promise<DonHang> {
    const res = await api.patch<ApiResponse<DonHang>>(`/admin/don-hang/${id}/duyet`);
    return res.data.data;
  },

  async giao(id: number): Promise<DonHang> {
    const res = await api.patch<ApiResponse<DonHang>>(`/admin/don-hang/${id}/giao`);
    return res.data.data;
  },

  async hoanTat(id: number): Promise<DonHang> {
    const res = await api.patch<ApiResponse<DonHang>>(`/admin/don-hang/${id}/hoan-tat`);
    return res.data.data;
  },

  async huy(id: number, lyDo?: string): Promise<DonHang> {
    const res = await api.patch<ApiResponse<DonHang>>(`/admin/don-hang/${id}/huy`, { lyDo });
    return res.data.data;
  },

  async xacNhanHoanKho(id: number): Promise<DonHang> {
    const res = await api.patch<ApiResponse<DonHang>>(`/admin/don-hang/${id}/hoan-kho`);
    return res.data.data;
  },
};
