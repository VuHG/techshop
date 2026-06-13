'use client';

import { useQuery } from '@tanstack/react-query';
import { reviewService } from '@/services/reviewService';
import { StarRating } from '@/components/ui/StarRating';
import { formatNgay } from '@/lib/utils';

export function ProductReviews({
  sanPhamId,
  diemTb,
  soLuot,
}: {
  sanPhamId: number;
  diemTb: number;
  soLuot: number;
}) {
  const { data } = useQuery({
    queryKey: ['danh-gia', sanPhamId],
    queryFn: () => reviewService.getTheoSanPham(sanPhamId),
  });
  const reviews = data?.items ?? [];

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xl font-bold text-gray-800">Đánh giá &amp; Nhận xét</h2>

      <div className="mb-4 flex items-center gap-4 rounded-lg bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-800">{(diemTb ?? 0).toFixed(1)}</p>
          <StarRating diem={diemTb ?? 0} className="justify-center" />
        </div>
        <p className="text-sm text-gray-500">{soLuot} lượt đánh giá</p>
      </div>

      {reviews.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-500">Chưa có đánh giá nào cho sản phẩm này.</p>
      ) : (
        <ul>
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-gray-100 py-3">
              <div className="flex items-center justify-between">
                <StarRating diem={r.diem} />
                <span className="text-xs text-gray-400">{formatNgay(r.ngayTao)}</span>
              </div>
              {r.noiDung && <p className="mt-1 text-sm text-gray-700">{r.noiDung}</p>}
              {r.media && r.media.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {r.media.map((m, j) =>
                    m.loaiMedia === 'VIDEO' ? (
                      <video
                        key={j}
                        src={m.urlMedia}
                        controls
                        className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={j}
                        src={m.urlMedia}
                        alt="Ảnh đánh giá"
                        className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                      />
                    ),
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
