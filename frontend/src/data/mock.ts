// Slide banner trang chủ (chỉ là ảnh quảng cáo, KHÔNG phải product card).
// Mọi product card trong frontend đều lấy 100% từ API/CSDL.
// CTA trỏ tới trang/danh mục CÓ THẬT trong app — không có giá giả.

export interface HeroSlide {
  id: number;
  tieuDe: string;
  moTa: string;
  cta: string;
  href: string;
  mauNen: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    tieuDe: 'Laptop chính hãng',
    moTa: 'Đa dạng thương hiệu — bảo hành chính hãng, trả góp 0%',
    cta: 'Khám phá ngay',
    href: '/danh-muc/laptop',
    mauNen: 'from-blue-600 to-blue-500',
  },
  {
    id: 2,
    tieuDe: 'PC Gaming cấu hình khủng',
    moTa: 'Build sẵn, hiệu năng cao cho game thủ và sáng tạo nội dung',
    cta: 'Xem PC Gaming',
    href: '/danh-muc/pc-gaming',
    mauNen: 'from-slate-800 to-slate-600',
  },
  {
    id: 3,
    tieuDe: 'Ưu đãi Flash Sale mỗi ngày',
    moTa: 'Săn deal công nghệ giá tốt — số lượng có hạn',
    cta: 'Săn deal ngay',
    href: '/khuyen-mai',
    mauNen: 'from-red-600 to-orange-500',
  },
];
