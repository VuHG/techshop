'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Star, ChevronRight } from 'lucide-react';
import { reviewService } from '@/services/reviewService';
import { AccountShell } from '@/components/account/AccountShell';
import { ProductImage } from '@/components/ui/ProductImage';
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
          {reviews.map((r) => {
            const noiDung = (
              <>
                <div className="flex items-start gap-3">
                  <ProductImage
                    src={r.anhSanPham}
                    alt={r.tenSanPham ?? 'Sản phẩm'}
                    className="h-14 w-14 shrink-0 rounded-lg border border-gray-100"
                  />
                  <div className="min-w-0 flex-1">
                    {r.tenSanPham && (
                      <p className="truncate text-sm font-medium text-gray-800">{r.tenSanPham}</p>
                    )}
                    <div className="mt-0.5 flex items-center justify-between">
                      <StarRating diem={r.diem} />
                      <span className="text-xs text-gray-400">{formatNgay(r.ngayTao)}</span>
                    </div>
                    {r.noiDung && <p className="mt-1 line-clamp-2 text-sm text-gray-700">{r.noiDung}</p>}
                    <p className="mt-1 text-xs text-gray-400">Đơn hàng #{r.donHangId}</p>
                  </div>
                  {r.slug && <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-300" />}
                </div>
              </>
            );
            return (
              <li key={r.id} className="py-3">
                {r.slug ? (
                  <Link href={`/san-pham/${r.slug}?danhGia=${r.id}#danh-gia-${r.id}`} className="block rounded-lg transition hover:bg-gray-50">
                    {noiDung}
                  </Link>
                ) : (
                  noiDung
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
