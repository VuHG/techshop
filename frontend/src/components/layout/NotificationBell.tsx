'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { cn, formatNgay } from '@/lib/utils';

export function NotificationBell() {
  const qc = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: soChuaDoc } = useQuery({
    queryKey: ['noti-count'],
    queryFn: notificationService.demChuaDoc,
    refetchInterval: 30000, // poll mỗi 30s
  });

  const { data: list } = useQuery({
    queryKey: ['noti-list'],
    queryFn: () => notificationService.getDanhSach(0, 8),
    enabled: open,
  });

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const moThongBao = async (id: number, loai: string) => {
    try {
      await notificationService.danhDaDoc(id);
    } catch {
      /* */
    }
    qc.invalidateQueries({ queryKey: ['noti-count'] });
    qc.invalidateQueries({ queryKey: ['noti-list'] });
    setOpen(false);
    if (loai === 'DON_HANG') router.push('/lich-su-mua-hang');
    else router.push('/thong-bao');
  };

  const items = list?.items ?? [];

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-label="Thông báo"
        onClick={() => setOpen((v) => !v)}
        className="relative text-gray-700 hover:text-primary"
      >
        <Bell className="h-6 w-6" />
        {!!soChuaDoc && soChuaDoc > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-sale px-1 text-[11px] font-bold text-white">
            {soChuaDoc}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border border-gray-100 bg-white shadow-lg">
          <div className="border-b border-gray-100 px-4 py-2 text-sm font-semibold text-gray-800">
            Thông báo
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">Chưa có thông báo nào.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => moThongBao(n.id, n.loaiThongBao)}
                  className={cn(
                    'block w-full px-4 py-2.5 text-left hover:bg-gray-50',
                    !n.daDoc && 'bg-primary-50/50',
                  )}
                >
                  <p className="text-sm font-medium text-gray-800">{n.tieuDe}</p>
                  <p className="line-clamp-2 text-xs text-gray-500">{n.noiDung}</p>
                  <p className="mt-0.5 text-[11px] text-gray-400">{formatNgay(n.ngayTao)}</p>
                </button>
              ))
            )}
          </div>
          <Link
            href="/thong-bao"
            onClick={() => setOpen(false)}
            className="block border-t border-gray-100 px-4 py-2 text-center text-sm text-primary hover:underline"
          >
            Xem tất cả
          </Link>
        </div>
      )}
    </div>
  );
}
