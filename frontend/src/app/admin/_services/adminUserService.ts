import { api } from '@/lib/api';
import type { ApiResponse, PageResult, DonHangSummary, DiaChi } from '@/types';

export interface AdminNguoiDung {
  id: number;
  hoTen: string;
  soDienThoai: string;
  email: string | null;
  ngaySinh: string | null;
  vaiTro: string;
  trangThai: string;
  ngayTao: string;
  thongKe?: { soDon: number; soDanhGia: number; soDiaChi: number };
  diaChis?: DiaChi[];
}

export interface NguoiDungCreatePayload {
  hoTen: string;
  soDienThoai: string;
  email?: string;
  ngaySinh?: string;
  matKhau: string;
  vaiTro: string;
}

export interface NguoiDungUpdatePayload {
  hoTen: string;
  email?: string;
  ngaySinh?: string;
  vaiTro: string;
}

export const adminUserService = {
  async getDanhSach(vaiTro?: string, trangThai?: string, search?: string, page = 0, size = 20) {
    const res = await api.get<ApiResponse<PageResult<AdminNguoiDung>>>('/admin/nguoi-dung', {
      params: {
        vaiTro: vaiTro || undefined,
        trangThai: trangThai || undefined,
        search: search || undefined,
        page,
        size,
      },
    });
    return res.data.data;
  },
  async getChiTiet(id: number): Promise<AdminNguoiDung> {
    const res = await api.get<ApiResponse<AdminNguoiDung>>(`/admin/nguoi-dung/${id}`);
    return res.data.data;
  },
  async getDonHang(id: number, page = 0, size = 10) {
    const res = await api.get<ApiResponse<PageResult<DonHangSummary>>>(
      `/admin/nguoi-dung/${id}/don-hang`,
      { params: { page, size } },
    );
    return res.data.data;
  },
  async taoMoi(payload: NguoiDungCreatePayload): Promise<AdminNguoiDung> {
    const res = await api.post<ApiResponse<AdminNguoiDung>>('/admin/nguoi-dung', payload);
    return res.data.data;
  },
  async capNhat(id: number, payload: NguoiDungUpdatePayload): Promise<AdminNguoiDung> {
    const res = await api.put<ApiResponse<AdminNguoiDung>>(`/admin/nguoi-dung/${id}`, payload);
    return res.data.data;
  },
  async doiTrangThai(id: number, trangThai: string): Promise<void> {
    await api.patch(`/admin/nguoi-dung/${id}/trang-thai`, { trangThai });
  },
  async resetMatKhau(id: number, matKhauMoi: string): Promise<void> {
    await api.post(`/admin/nguoi-dung/${id}/reset-mat-khau`, { matKhauMoi });
  },
};
