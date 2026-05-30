import { api } from '@/lib/api';
import type { ApiResponse, PageResult, ThongBao } from '@/types';

export const notificationService = {
  async getDanhSach(page = 0, size = 20): Promise<PageResult<ThongBao>> {
    const res = await api.get<ApiResponse<PageResult<ThongBao>>>('/thong-bao', {
      params: { page, size },
    });
    return res.data.data;
  },

  async demChuaDoc(): Promise<number> {
    const res = await api.get<ApiResponse<number>>('/thong-bao/chua-doc/dem');
    return res.data.data;
  },

  async danhDaDoc(id: number): Promise<void> {
    await api.patch(`/thong-bao/${id}/da-doc`);
  },

  async danhDaDocTatCa(): Promise<void> {
    await api.patch('/thong-bao/da-doc-tat-ca');
  },
};
