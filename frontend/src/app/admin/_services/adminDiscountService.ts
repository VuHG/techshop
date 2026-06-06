import { api } from '@/lib/api';
import type { ApiResponse, PageResult } from '@/types';

export interface MaGiamGia {
  id: number;
  maCode: string;
  tenMa: string;
  loaiGiam: string;
  giaTriGiam: number;
  giaTriGiamToiDa: number | null;
  dieuKienToiThieu: number | null;
  soLuongToiDa: number;
  soLuongDaDung: number;
  batDau: string;
  ketThuc: string;
  trangThai: string;
  tinhTrang: string;
  sanPhamIds?: number[];
  lichSu?: { nguoiDungId: number; donHangId: number; ngayTao: string }[];
}

export interface MaGiamGiaPayload {
  maCode: string;
  tenMa: string;
  loaiGiam: string;
  giaTriGiam: number;
  giaTriGiamToiDa?: number | null;
  dieuKienToiThieu?: number | null;
  soLuongToiDa: number;
  batDau: string;
  ketThuc: string;
  trangThai: string;
  sanPhamIds?: number[];
}

export const adminDiscountService = {
  async getDanhSach(tinhTrang?: string, search?: string, page = 0, size = 20) {
    const res = await api.get<ApiResponse<PageResult<MaGiamGia>>>('/admin/ma-giam-gia', {
      params: { tinhTrang: tinhTrang || undefined, search: search || undefined, page, size },
    });
    return res.data.data;
  },
  async getChiTiet(id: number): Promise<MaGiamGia> {
    const res = await api.get<ApiResponse<MaGiamGia>>(`/admin/ma-giam-gia/${id}`);
    return res.data.data;
  },
  async taoMoi(payload: MaGiamGiaPayload): Promise<MaGiamGia> {
    const res = await api.post<ApiResponse<MaGiamGia>>('/admin/ma-giam-gia', payload);
    return res.data.data;
  },
  async capNhat(id: number, payload: MaGiamGiaPayload): Promise<MaGiamGia> {
    const res = await api.put<ApiResponse<MaGiamGia>>(`/admin/ma-giam-gia/${id}`, payload);
    return res.data.data;
  },
  async doiTrangThai(id: number, trangThai: string): Promise<void> {
    await api.patch(`/admin/ma-giam-gia/${id}/trang-thai`, { trangThai });
  },
  async xoa(id: number): Promise<void> {
    await api.delete(`/admin/ma-giam-gia/${id}`);
  },
};
