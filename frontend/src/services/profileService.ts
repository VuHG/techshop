import { api } from '@/lib/api';
import type { ApiResponse, DiaChi, Profile } from '@/types';

export interface CapNhatProfilePayload {
  hoTen: string;
  email?: string;
  ngaySinh?: string;
}

export interface DiaChiPayload {
  hoTenNguoiNhan: string;
  soDienThoai: string;
  diaChiChiTiet: string;
  phuongXa: string;
  quanHuyen: string;
  tinhThanh: string;
  laMacDinh: boolean;
}

export const profileService = {
  async getProfile(): Promise<Profile> {
    const res = await api.get<ApiResponse<Profile>>('/profile');
    return res.data.data;
  },

  async capNhatProfile(payload: CapNhatProfilePayload): Promise<Profile> {
    const res = await api.put<ApiResponse<Profile>>('/profile', payload);
    return res.data.data;
  },

  async getDiaChi(): Promise<DiaChi[]> {
    const res = await api.get<ApiResponse<DiaChi[]>>('/dia-chi');
    return res.data.data;
  },

  async themDiaChi(payload: DiaChiPayload): Promise<DiaChi> {
    const res = await api.post<ApiResponse<DiaChi>>('/dia-chi', payload);
    return res.data.data;
  },

  async capNhatDiaChi(id: number, payload: DiaChiPayload): Promise<DiaChi> {
    const res = await api.put<ApiResponse<DiaChi>>(`/dia-chi/${id}`, payload);
    return res.data.data;
  },

  async xoaDiaChi(id: number): Promise<void> {
    await api.delete(`/dia-chi/${id}`);
  },

  async datMacDinh(id: number): Promise<DiaChi> {
    const res = await api.patch<ApiResponse<DiaChi>>(`/dia-chi/${id}/mac-dinh`);
    return res.data.data;
  },
};
