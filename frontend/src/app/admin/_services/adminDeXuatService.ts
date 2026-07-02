import { api } from '@/lib/api';
import type { ApiResponse } from '@/types';

export interface DeXuatGia {
  id: number;
  bienTheId: number;
  tenSanPham: string | null;
  mauSac: string | null;
  gia: number | null;      // giá gốc
  giaCu: number | null;    // giá đang bán trước đề xuất
  giaDeXuat: number;
  lyDo: string;
  ngayTao: string;
  ngayHetHan: string;
}

export interface DeXuatVoucher {
  id: number;
  phamVi: 'SAN_PHAM' | 'TONG_HOA_DON';
  sanPhamId: number | null;
  tenSanPham: string | null;
  tenMa: string;
  loaiGiam: string;        // PHAN_TRAM | SO_TIEN_CO_DINH
  giaTriGiam: number;
  giaTriGiamToiDa: number | null;
  dieuKienToiThieu: number | null;
  soNgayHieuLuc: number;
  lyDo: string;
  ngayTao: string;
  ngayHetHan: string;
}

export const adminDeXuatService = {
  async getGia(): Promise<DeXuatGia[]> {
    const res = await api.get<ApiResponse<DeXuatGia[]>>('/admin/de-xuat/gia');
    return res.data.data;
  },
  async getVoucher(): Promise<DeXuatVoucher[]> {
    const res = await api.get<ApiResponse<DeXuatVoucher[]>>('/admin/de-xuat/voucher');
    return res.data.data;
  },
  async chapNhanGia(id: number): Promise<void> {
    await api.post(`/admin/de-xuat/gia/${id}/chap-nhan`);
  },
  async tuChoiGia(id: number): Promise<void> {
    await api.post(`/admin/de-xuat/gia/${id}/tu-choi`);
  },
  async chapNhanVoucher(id: number): Promise<void> {
    await api.post(`/admin/de-xuat/voucher/${id}/chap-nhan`);
  },
  async tuChoiVoucher(id: number): Promise<void> {
    await api.post(`/admin/de-xuat/voucher/${id}/tu-choi`);
  },
  async taoNgay(): Promise<{ deXuatGia: number; deXuatVoucher: number }> {
    const res = await api.post<ApiResponse<{ deXuatGia: number; deXuatVoucher: number }>>(
      '/admin/de-xuat/tao-ngay',
    );
    return res.data.data;
  },
};
