'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Laptop } from 'lucide-react';
import { HERO_SLIDES } from '@/data/mock';
import { formatPrice } from '@/lib/utils';

import 'swiper/css';
import 'swiper/css/pagination';

export function HeroBanner() {
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 4000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      loop
      className="h-56 overflow-hidden rounded-2xl md:h-72"
    >
      {HERO_SLIDES.map((s) => (
        <SwiperSlide key={s.id}>
          <div className={`flex h-full items-center bg-gradient-to-r ${s.mauNen} px-8 text-white`}>
            <div className="flex-1">
              <h2 className="text-2xl font-bold md:text-4xl">{s.tieuDe}</h2>
              <p className="mt-2 text-sm text-white/90 md:text-base">{s.moTa}</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-xl font-bold md:text-2xl">{formatPrice(s.gia)}</span>
                <span className="text-sm text-white/70 line-through">{formatPrice(s.giaGoc)}</span>
              </div>
              <button
                type="button"
                className="mt-4 rounded-lg bg-white px-5 py-2 text-sm font-semibold text-primary transition hover:bg-gray-100"
              >
                Mua ngay
              </button>
            </div>
            <Laptop className="hidden h-32 w-32 text-white/30 md:block" />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
