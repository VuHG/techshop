'use client';

import { useState } from 'react';
import { ProductImage } from '@/components/ui/ProductImage';
import { cn } from '@/lib/utils';
import type { Anh } from '@/types';

export function ProductGallery({ images, alt }: { images: Anh[]; alt: string }) {
  const [idx, setIdx] = useState(0);

  if (images.length === 0) {
    return <ProductImage src={null} alt={alt} className="aspect-square w-full rounded-xl" />;
  }

  const active = images[Math.min(idx, images.length - 1)];

  return (
    <div>
      <ProductImage
        src={active.urlAnh}
        alt={alt}
        className="aspect-square w-full rounded-xl border border-gray-100"
      />
      {images.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {images.map((a, i) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                'h-16 w-16 shrink-0 overflow-hidden rounded-lg border',
                i === idx ? 'border-primary' : 'border-gray-200',
              )}
            >
              <ProductImage src={a.urlAnh} alt={alt} className="h-full w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
