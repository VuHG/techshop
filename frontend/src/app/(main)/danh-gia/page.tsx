'use client';

import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { reviewService } from '@/services/reviewService';
import { AccountShell } from '@/components/account/AccountShell';
import { StarRating } from '@/components/ui/StarRating';
import { formatNgay } from '@/lib/utils';

export default function DanhGiaPage() {
  return (
    <AccountShell>
      <DanhGiaContent />
    </AccountShell>
  );
}

function DanhGiaContent() {
  const { data, isLoading } = useQuery({
    queryKey: ['danh-gia-cua-toi'],
    queryFn: () => reviewService.getCuaToi(),
  });
  const reviews = data?.items ?? [];

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <h1 className="mb-4 text-xl font-bold text-gray-800">Đánh giá của tôi</h1>

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center text-gray-500">
          <Star className="h-10 w-10 text-gray-300" />
          <p className="mt-2">Bạn chưa có đánh giá nào.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {reviews.map((r) => (
            <li key={r.id} className="py-3">
              <div className="flex items-center justify-between">
                <StarRating diem={r.diem} />
                <span className="text-xs text-gray-400">{formatNgay(r.ngayTao)}</span>
              </div>
              {r.noiDung && <p className="mt-1 text-sm text-gray-700">{r.noiDung}</p>}
              <p className="mt-1 text-xs text-gray-400">Đơn hàng #{r.donHangId}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
