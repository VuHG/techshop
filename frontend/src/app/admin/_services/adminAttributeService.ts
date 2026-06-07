import { api } from '@/lib/api';
import type { ApiResponse } from '@/types';

export interface ThuocTinh {
  id: number;
  tenThuocTinh: string;
  maThuocTinh: string;
  kieuDuLieu: string;
  thuTuHienThi: number | null;
  giaTris: { id: number; giaTri: string }[];
}

export interface ThuocTinhPayload {
  phanLoaiId?: number;
  tenThuocTinh: string;
  maThuocTinh?: string;
  kieuDuLieu?: string;
  thuTuHienThi?: number;
  giaTris: string[];
}

export const adminAttributeService = {
  async getDanhSach(phanLoaiId: number): Promise<ThuocTinh[]> {
    const res = await api.get<ApiResponse<ThuocTinh[]>>('/admin/thuoc-tinh', {
      params: { phanLoaiId },
    });
    return res.data.data;
  },
  async taoMoi(payload: ThuocTinhPayload): Promise<ThuocTinh> {
    const res = await api.post<ApiResponse<ThuocTinh>>('/admin/thuoc-tinh', payload);
    return res.data.data;
  },
  async capNhat(id: number, payload: ThuocTinhPayload): Promise<ThuocTinh> {
    const res = await api.put<ApiResponse<ThuocTinh>>(`/admin/thuoc-tinh/${id}`, payload);
    return res.data.data;
  },
  async xoa(id: number): Promise<void> {
    await api.delete(`/admin/thuoc-tinh/${id}`);
  },
};
