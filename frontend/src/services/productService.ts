import { api } from '@/lib/api';
import type {
  ApiResponse,
  BienTheCard,
  DanhMuc,
  FilterSchema,
  PageResult,
  PhanLoai,
  SanPhamCard,
  SanPhamDetail,
  Suggest,
} from '@/types';

export type SortValue = 'newest' | 'rating' | 'sold' | 'price_asc' | 'price_desc';

export interface SanPhamQuery {
  phanLoaiId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: SortValue;
  /** Chuỗi JSON tiêu chí lọc JSONB, vd '{"ram":"16GB","cpu":"Intel Core i7"}'. */
  thongSo?: string;
  /** true = chỉ sản phẩm khuyến mãi (giá bán < giá niêm yết). */
  khuyenMai?: boolean;
  /** ma_nhan để lọc theo tag, vd 'noi-bat' (Nổi bật), 'hot'... */
  nhan?: string;
  page?: number;
  size?: number;
}

export const productService = {
  async getSanPham(params: SanPhamQuery): Promise<PageResult<BienTheCard>> {
    const res = await api.get<ApiResponse<PageResult<BienTheCard>>>('/san-pham', { params });
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

  /**
   * Ứng cử viên so sánh.
   * @param phanLoaiId undefined = lượt chọn đầu tiên (toàn bộ cửa hàng); có giá trị = chỉ SP tương quan cùng phân loại mốc.
   */
  async getUngCuSoSanh(
    phanLoaiId: number | undefined,
    loaiTruIds: number[],
    search?: string,
  ): Promise<SanPhamCard[]> {
    const res = await api.get<ApiResponse<SanPhamCard[]>>('/san-pham/ung-cu-so-sanh', {
      params: {
        phanLoaiId,
        loaiTruIds: loaiTruIds.length ? loaiTruIds.join(',') : undefined,
        search: search && search.trim() ? search.trim() : undefined,
      },
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
