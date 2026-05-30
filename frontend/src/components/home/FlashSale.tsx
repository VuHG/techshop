'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import { FLASH_SALE_PRODUCTS } from '@/data/mock';
import { ProductCard } from '@/components/product/ProductCard';

export function FlashSale() {
  const { gio, phut, giay } = useCountdown();

  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm">
      {/* Thanh tiêu đề đỏ */}
      <div className="flex items-center justify-between bg-flash-gradient px-4 py-2.5 text-white">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          <span className="font-bold">Flash Sale</span>
          <span className="hidden text-sm sm:inline">Kết thúc sau:</span>
          <span className="flex items-center gap-1">
            <Box>{gio}</Box>:<Box>{phut}</Box>:<Box>{giay}</Box>
          </span>
        </div>
        <Link href="/khuyen-mai" className="text-sm font-medium hover:underline">
          Xem tất cả →
        </Link>
      </div>

      {/* Dải sản phẩm cuộn ngang */}
      <div className="no-scrollbar flex gap-3 overflow-x-auto p-4">
        {FLASH_SALE_PRODUCTS.map((sp) => (
          <div key={sp.id} className="w-44 shrink-0">
            <ProductCard sanPham={sp} variant="flash" />
          </div>
        ))}
      </div>
    </section>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-black/25 px-1.5 py-0.5 text-sm font-bold tabular-nums">
      {children}
    </span>
  );
}
