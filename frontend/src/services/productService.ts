import { api } from '@/lib/api';
import type {
  ApiResponse,
  DanhMuc,
  FilterSchema,
  PageResult,
  PhanLoai,
  SanPhamCard,
  SanPhamDetail,
  Suggest,
} from '@/types';

export interface SanPhamQuery {
  phanLoaiId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'rating' | 'sold';
  page?: number;
  size?: number;
}

export const productService = {
  async getSanPham(params: SanPhamQuery): Promise<PageResult<SanPhamCard>> {
    const res = await api.get<ApiResponse<PageResult<SanPhamCard>>>('/san-pham', { params });
    return res.data.data;
  },

  async getChiTiet(slug: string): Promise<SanPhamDetail> {
    const res = await api.get<ApiResponse<SanPhamDetail>>(`/san-pham/${slug}`);
    return res.data.data;
  },

  async getSuggest(q: string): Promise<Suggest[]> {
    const res = await api.get<ApiResponse<Suggest[]>>('/san-pham/goi-y', { params: { q } });
    return res.data.data;
  },

  async getSoSanh(ids: number[]): Promise<SanPhamDetail[]> {
    const res = await api.get<ApiResponse<SanPhamDetail[]>>('/san-pham/so-sanh', {
      params: { ids: ids.join(',') },
    });
    return res.data.data;
  },

  async getUngCuSoSanh(phanLoaiId: number, loaiTruIds: number[]): Promise<SanPhamCard[]> {
    const res = await api.get<ApiResponse<SanPhamCard[]>>('/san-pham/ung-cu-so-sanh', {
      params: { phanLoaiId, loaiTruIds: loaiTruIds.length ? loaiTruIds.join(',') : undefined },
    });
    return res.data.data;
  },

  async getCayDanhMuc(): Promise<DanhMuc[]> {
    const res = await api.get<ApiResponse<DanhMuc[]>>('/danh-muc');
    return res.data.data;
  },

  async getPhanLoai(slug: string): Promise<PhanLoai[]> {
    const res = await api.get<ApiResponse<PhanLoai[]>>(`/danh-muc/${slug}/phan-loai`);
    return res.data.data;
  },

  async getFilterSchema(phanLoaiId: number): Promise<FilterSchema> {
    const res = await api.get<ApiResponse<FilterSchema>>(`/phan-loai/${phanLoaiId}/filter-schema`);
    return res.data.data;
  },
};
