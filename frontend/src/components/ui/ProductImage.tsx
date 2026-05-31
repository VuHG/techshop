'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Ảnh sản phẩm. Nếu chưa có URL hoặc URL hỏng (vd ảnh seed giả không tải được)
 * thì hiện placeholder "Ảnh". Dùng `unoptimized` để tránh server-side fetch
 * (URL giả không phân giải được sẽ làm /_next/image trả 500).
 */
export function ProductImage({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [loi, setLoi] = useState(false);

  if (!src || loi) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-sm text-gray-400',
          className,
        )}
      >
        Ảnh
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        className="object-contain"
        sizes="(max-width: 768px) 50vw, 25vw"
        onError={() => setLoi(true)}
      />
    </div>
  );
}
