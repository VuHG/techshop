'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { AccountShell } from '@/components/account/AccountShell';
import { cn, formatNgay } from '@/lib/utils';

export default function ThongBaoPage() {
  return (
    <AccountShell>
      <ThongBaoContent />
    </AccountShell>
  );
}

function ThongBaoContent() {
  const qc = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['noti-page'],
    queryFn: () => notificationService.getDanhSach(0, 50),
  });
  const items = data?.items ?? [];

  const lamMoi = () => {
    qc.invalidateQueries({ queryKey: ['noti-page'] });
    qc.invalidateQueries({ queryKey: ['noti-count'] });
    qc.invalidateQueries({ queryKey: ['noti-list'] });
  };

  const mo = async (id: number, loai: string) => {
    try {
      await notificationService.danhDaDoc(id);
    } catch {
      /* */
    }
    lamMoi();
    if (loai === 'DON_HANG') router.push('/lich-su-mua-hang');
  };

  const docTatCa = async () => {
    try {
      await notificationService.danhDaDocTatCa();
      toast.success('Đã đánh dấu tất cả là đã đọc');
      lamMoi();
    } catch {
      /* */
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Thông báo</h1>
        {items.length > 0 && (
          <button type="button" onClick={docTatCa} className="text-sm text-primary hover:underline">
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center text-gray-500">
          <Bell className="h-10 w-10 text-gray-300" />
          <p className="mt-2">Chưa có thông báo nào.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {items.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => mo(n.id, n.loaiThongBao)}
                className={cn('block w-full py-3 text-left', !n.daDoc && 'rounded-lg bg-primary-50/50 px-2')}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">{n.tieuDe}</p>
                  {!n.daDoc && <span className="h-2 w-2 shrink-0 rounded-full bg-sale" />}
                </div>
                <p className="text-sm text-gray-600">{n.noiDung}</p>
                <p className="mt-0.5 text-xs text-gray-400">{formatNgay(n.ngayTao)}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
