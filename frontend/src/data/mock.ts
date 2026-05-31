// Slide banner trang chủ (chỉ là ảnh quảng cáo, KHÔNG phải product card).
// Mọi product card trong frontend đều lấy 100% từ API/CSDL.

export interface HeroSlide {
  id: number;
  tieuDe: string;
  moTa: string;
  gia: number;
  giaGoc: number;
  mauNen: string;
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
