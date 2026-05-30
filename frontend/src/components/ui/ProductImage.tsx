import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Ảnh sản phẩm. Nếu chưa có URL (mock Phase 7) thì hiện placeholder "Ảnh"
 * giống bản thiết kế. Phase 8 truyền `src` thật từ API.
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
  if (!src) {
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
      <Image src={src} alt={alt} fill className="object-contain" sizes="(max-width: 768px) 50vw, 25vw" />
    </div>
  );
}
