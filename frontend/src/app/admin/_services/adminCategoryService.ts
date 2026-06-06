import { api } from '@/lib/api';
import type { ApiResponse } from '@/types';

export interface PhanLoaiNode {
  id: number;
  tenPhanLoai: string;
  soSanPham: number;
}

export interface DanhMucTree {
  id: number;
  tenDanhMuc: string;
  slug: string;
  trangThai: string;
  thuTuHienThi: number | null;
  phanLoais: PhanLoaiNode[];
}

export interface DanhMucPayload {
  tenDanhMuc: string;
  slug?: string;
  thuTuHienThi?: number;
  trangThai?: string;
}

export interface PhanLoaiPayload {
  tenPhanLoai: string;
  danhMucId: number;
}

export const adminCategoryService = {
  async getCay(): Promise<DanhMucTree[]> {
    const res = await api.get<ApiResponse<DanhMucTree[]>>('/admin/danh-muc/cay');
    return res.data.data;
  },

  async taoDanhMuc(payload: DanhMucPayload): Promise<void> {
    await api.post('/admin/danh-muc', payload);
  },
  async capNhatDanhMuc(id: number, payload: DanhMucPayload): Promise<void> {
    await api.put(`/admin/danh-muc/${id}`, payload);
  },
  async doiTrangThai(id: number, trangThai: string): Promise<void> {
    await api.patch(`/admin/danh-muc/${id}/trang-thai`, { trangThai });
  },
  async xoaDanhMuc(id: number): Promise<void> {
    await api.delete(`/admin/danh-muc/${id}`);
  },

  async taoPhanLoai(payload: PhanLoaiPayload): Promise<void> {
    await api.post('/admin/danh-muc/phan-loai', payload);
  },
  async capNhatPhanLoai(id: number, payload: PhanLoaiPayload): Promise<void> {
    await api.put(`/admin/danh-muc/phan-loai/${id}`, payload);
  },
  async xoaPhanLoai(id: number): Promise<void> {
    await api.delete(`/admin/danh-muc/phan-loai/${id}`);
  },
};
