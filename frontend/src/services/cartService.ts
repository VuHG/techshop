import { api } from '@/lib/api';
import type { ApiResponse, GioHang } from '@/types';

export const cartService = {
  async getGioHang(): Promise<GioHang> {
    const res = await api.get<ApiResponse<GioHang>>('/gio-hang');
    return res.data.data;
  },

  async themVaoGio(bienTheId: number, soLuong: number): Promise<GioHang> {
    const res = await api.post<ApiResponse<GioHang>>('/gio-hang', { bienTheId, soLuong });
    return res.data.data;
  },

  async capNhatSoLuong(itemId: number, soLuong: number): Promise<GioHang> {
    const res = await api.put<ApiResponse<GioHang>>(`/gio-hang/${itemId}`, { soLuong });
    return res.data.data;
  },

  async xoaItem(itemId: number): Promise<GioHang> {
    const res = await api.delete<ApiResponse<GioHang>>(`/gio-hang/${itemId}`);
    return res.data.data;
  },

  async xoaTatCa(): Promise<GioHang> {
    const res = await api.delete<ApiResponse<GioHang>>('/gio-hang');
    return res.data.data;
  },
};
