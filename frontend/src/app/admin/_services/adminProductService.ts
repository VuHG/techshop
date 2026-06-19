import { api } from '@/lib/api';
import type { ApiResponse, PageResult } from '@/types';

export interface BienTheDong {
  id: number;
  maBienThe: string | null;
  tenBienThe: string | null;
  mauSac: string | null;
  soLuotBan: number;
  laMacDinh: boolean;
  thongSoBienThe: Record<string, unknown>;
  gia: number;
  giaKhuyenMai: number | null;
  soLuongTon: number;
  trangThai: string;
  anhChinh: string | null;
  nhanIds: number[];
}

/** Filter schema (chi_tiet_thuoc_tinh_loc.thong_so_loc) cho dropdown thông số biến thể. */
export type FilterSchema = Record<string, { label: string; values: string[] }>;

export interface BienThePayload {
  tenBienThe?: string;
  mauSac?: string | null;
  gia: number;
  giaBan?: number | null;
  soLuongTon: number;
  laMacDinh: boolean;
  thongSoBienThe: Record<string, string>;
  nhanIds: number[];
}

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
  bienThes: BienTheDong[];
}

export interface AdminBienThe {
  id?: number;
  maBienThe: string | null;
  tenSanPham?: string | null;
  thuongHieu?: string | null;
  tenBienThe?: string | null;
  mauSac?: string | null;
  soLuotBan?: number;
  laMacDinh?: boolean;
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
  trangThai: string;
  diemDanhGiaTb?: number | null;
  soLuotDanhGia?: number;
  soLuotBan?: number;
  ngayTao?: string;
  ngayCapNhat?: string;
  anhDaiDien?: string | null;
  nhanIds?: number[];
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
  trangThai: string;
  anhDaiDien?: string;
  nhanIds?: number[];
  bienThes?: AdminBienThe[];
}

export interface FormOptions {
  phanLoais: { id: number; tenPhanLoai: string; danhMucId: number; tenDanhMuc: string }[];
  nhans: { id: number; tenNhan: string; mauSac: string | null }[];
}

export const adminProductService = {
  async getDanhSach(
    trangThai?: string,
    search?: string,
    page = 0,
    size = 20,
    danhMucId?: number,
    phanLoaiId?: number,
  ) {
    const res = await api.get<ApiResponse<PageResult<AdminSanPhamSummary>>>('/admin/san-pham', {
      params: {
        trangThai: trangThai || undefined,
        search: search || undefined,
        danhMucId: danhMucId ?? undefined,
        phanLoaiId: phanLoaiId ?? undefined,
        page,
        size,
      },
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

  async doiTrangThaiBienThe(bienTheId: number, trangThai: string): Promise<void> {
    await api.patch(`/admin/san-pham/bien-the/${bienTheId}/trang-thai`, { trangThai });
  },

  async xoaBienThe(bienTheId: number): Promise<void> {
    await api.delete(`/admin/san-pham/bien-the/${bienTheId}`);
  },

  async themBienThe(sanPhamId: number, payload: BienThePayload): Promise<void> {
    await api.post(`/admin/san-pham/${sanPhamId}/bien-the`, payload);
  },

  async suaBienThe(bienTheId: number, payload: BienThePayload): Promise<void> {
    await api.put(`/admin/san-pham/bien-the/${bienTheId}`, payload);
  },

  /** Kho hàng: cập nhật tồn 1 biến thể. */
  async capNhatTonKho(bienTheId: number, soLuongTon: number): Promise<void> {
    await api.patch(`/admin/kho/bien-the/${bienTheId}/ton`, { soLuongTon });
  },

  /** Filter schema của phân loại (cho dropdown thông số biến thể). */
  async getFilterSchema(phanLoaiId: number): Promise<FilterSchema> {
    const res = await api.get<ApiResponse<FilterSchema>>(
      `/phan-loai/${phanLoaiId}/filter-schema`,
    );
    return res.data.data;
  },
};
