import type { SanPham } from '@/types';

// Dữ liệu mẫu cho Phase 7 (trang chủ). Phase 8 thay bằng API thật.

export interface HeroSlide {
  id: number;
  tieuDe: string;
  moTa: string;
  gia: number;
  giaGoc: number;
  mauNen: string; // class gradient nền
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    tieuDe: 'iPhone 15 Pro Max',
    moTa: 'Thiết kế Titanium, hiệu năng vượt trội',
    gia: 29_990_000,
    giaGoc: 32_990_000,
    mauNen: 'from-blue-600 to-blue-500',
  },
  {
    id: 2,
    tieuDe: 'MacBook Pro M3',
    moTa: 'Sức mạnh chip Apple Silicon thế hệ mới',
    gia: 39_990_000,
    giaGoc: 45_990_000,
    mauNen: 'from-slate-800 to-slate-600',
  },
  {
    id: 3,
    tieuDe: 'ASUS ROG Strix G15',
    moTa: 'Gaming đỉnh cao, tản nhiệt mạnh mẽ',
    gia: 25_990_000,
    giaGoc: 31_990_000,
    mauNen: 'from-red-600 to-orange-500',
  },
];

export const FLASH_SALE_PRODUCTS: SanPham[] = [
  fakeSP(101, 'Samsung Galaxy Watch 6', 3_490_000, 4_990_000, 4.6, 87, 12, 20),
  fakeSP(102, 'Tai nghe Sony WH-1000XM5', 5_990_000, 7_990_000, 4.8, 213, 18, 20),
  fakeSP(103, 'Xiaomi Mi Band 8', 1_290_000, 1_990_000, 4.5, 156, 8, 20),
  fakeSP(104, 'Apple Watch SE 2', 6_490_000, 7_490_000, 4.7, 98, 15, 20),
  fakeSP(105, 'Chuột Logitech G Pro X', 2_990_000, 3_990_000, 4.9, 342, 9, 20),
  fakeSP(106, 'Bàn phím Keychron K8', 2_190_000, 2_900_000, 4.7, 121, 6, 20),
];

export const FEATURED_PRODUCTS: SanPham[] = [
  fakeSP(1, 'MacBook Pro 14" M2 Pro 2023 12CPU/19GPU/16GB/1TB', 39_990_000, 45_990_000, 4.5, 18),
  fakeSP(2, 'MacBook Pro 16" M3 Max 2024 16GB/1TB', 59_990_000, 65_990_000, 4.8, 24),
  fakeSP(3, 'MacBook Air 13" M2 8GB/256GB', 24_990_000, 27_990_000, 4.6, 56),
  fakeSP(4, 'ASUS ROG Strix G15 i7-13700H RTX 4060', 39_990_000, 45_990_000, 4.7, 33),
  fakeSP(5, 'Dell XPS 15 9530 i7/16GB/512GB', 45_990_000, 52_990_000, 4.6, 27),
  fakeSP(6, 'Laptop Lenovo LOQ i5-12450H RTX 2050', 18_990_000, 22_990_000, 4.4, 41),
];

function fakeSP(
  id: number,
  ten: string,
  gia: number,
  giaGoc: number,
  diem: number,
  soDanhGia: number,
  daBan?: number,
  tong?: number,
): SanPham {
  return {
    id,
    slug: `san-pham-${id}`,
    tenSanPham: ten,
    giaBan: gia,
    giaGoc,
    diemDanhGiaTb: diem,
    soLuotDanhGia: soDanhGia,
    duongDanAnhChinh: null,
    noiBat: true,
    daBan,
    tongSoLuong: tong,
  };
}
