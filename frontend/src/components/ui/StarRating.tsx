import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Hiển thị điểm sao (đọc-only) theo điểm trung bình 0–5. */
export function StarRating({ diem, className }: { diem: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-label={`${diem} sao`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const day = i + 1 <= Math.round(diem);
        return (
          <Star
            key={i}
            className={cn('h-3.5 w-3.5', day ? 'fill-amber-400 text-amber-400' : 'text-gray-300')}
          />
        );
      })}
    </div>
  );
}
