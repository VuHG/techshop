import { api } from '@/lib/api';
import type { ApiResponse, DonHangSummary } from '@/types';

export interface DashboardData {
  kpi: {
    tongDoanhThu: number;
    donMoi: number;
    khachMoi: number;
    donChoXuLy: number;
    doanhThuThayDoi: number | null;
    donThayDoi: number | null;
    khachThayDoi: number | null;
  };
  doanhThuTheoNgay: { ngay: string; doanhThu: number }[];
  doanhThuTheoDanhMuc: { tenDanhMuc: string; doanhThu: number }[];
  donMoiNhat: DonHangSummary[];
}

export const adminDashboardService = {
  async get(range = '30d'): Promise<DashboardData> {
    const res = await api.get<ApiResponse<DashboardData>>('/admin/dashboard', {
      params: { range },
    });
    return res.data.data;
  },
};
