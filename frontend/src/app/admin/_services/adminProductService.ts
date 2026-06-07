import { api } from '@/lib/api';
import type { ApiResponse, PageResult } from '@/types';

export interface AdminSanPhamSummary {
  id: number;
  tenSanPham: string;
  slug: string;
  thuongHieu: string | null;
  phanLoaiId: number;
  tenPhanLoai: string | null;
  tenDanhMuc: string | null;
  anhChinh: string | null;
  giaThap: number | null;
  giaCao: number | null;
  tongTon: number;
  soBienThe: number;
  trangThai: string;
  nhans: string[];
}

export interface AdminBienThe {
  id?: number;
  maBienThe: string | null;
  thongSoBienThe: Record<string, string>;
  gia: number;
  giaKhuyenMai: number | null;
  soLuongTon: number;
  trangThai: string;
  anhUrls: string[];
  nhanIds: number[];
  nhanTens?: string[];
}

export interface AdminSanPhamDetail {
  id: number;
  tenSanPham: string;
  slug: string;
  moTa: string | null;
  moTaNgan: string | null;
  phanLoaiId: number;
  tenPhanLoai?: string | null;
  tenDanhMuc?: string | null;
  thuongHieu: string | null;
  thongSoKyThuat: Record<string, string>;
  trangThai: string;
  anhUrls?: string[];
  bienThes: AdminBienThe[];
  vouchers?: { maCode: string; tenMa: string }[];
}

export interface SanPhamPayload {
  tenSanPham: string;
  slug?: string;
  moTa?: string;
  moTaNgan?: string;
  phanLoaiId: number;
  thuongHieu?: string;
  thongSoKyThuat?: Record<string, string>;
  trangThai: string;
  anhUrls?: string[];
  bienThes?: AdminBienThe[];
}

export interface FormOptions {
  phanLoais: { id: number; tenPhanLoai: string; danhMucId: number; tenDanhMuc: string }[];
  nhans: { id: number; tenNhan: string; mauSac: string | null }[];
}

export const adminProductService = {
  async getDanhSach(trangThai?: string, search?: string, page = 0, size = 20) {
    const res = await api.get<ApiResponse<PageResult<AdminSanPhamSummary>>>('/admin/san-pham', {
      params: { trangThai: trangThai || undefined, search: search || undefined, page, size },
    });
    return res.data.data;
  },

  async demTrangThai(): Promise<Record<string, number>> {
    const res = await api.get<ApiResponse<Record<string, number>>>(
      '/admin/san-pham/dem-trang-thai',
    );
    return res.data.data;
  },

  async getFormOptions(): Promise<FormOptions> {
    const res = await api.get<ApiResponse<FormOptions>>('/admin/san-pham/tuy-chon');
    return res.data.data;
  },

  async getChiTiet(id: number): Promise<AdminSanPhamDetail> {
    const res = await api.get<ApiResponse<AdminSanPhamDetail>>(`/admin/san-pham/${id}`);
    return res.data.data;
  },

  async taoMoi(payload: SanPhamPayload): Promise<AdminSanPhamDetail> {
    const res = await api.post<ApiResponse<AdminSanPhamDetail>>('/admin/san-pham', payload);
    return res.data.data;
  },

  async capNhat(id: number, payload: SanPhamPayload): Promise<AdminSanPhamDetail> {
    const res = await api.put<ApiResponse<AdminSanPhamDetail>>(`/admin/san-pham/${id}`, payload);
    return res.data.data;
  },

  async doiTrangThai(id: number, trangThai: string): Promise<void> {
    await api.patch(`/admin/san-pham/${id}/trang-thai`, { trangThai });
  },

  async xoa(id: number): Promise<void> {
    await api.delete(`/admin/san-pham/${id}`);
  },
};
