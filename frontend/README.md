# TechShop Frontend

Giao diện người dùng TechShop — **Next.js 14 (App Router) + TypeScript + Tailwind CSS**.

## Chạy local
```bash
cd frontend
cp .env.example .env.local   # chỉnh URL nếu cần
npm install
npm run dev                  # http://localhost:3000
```

> Backend phải chạy ở `:8080` và AI gateway ở `:3001` để các tính năng động hoạt động (Phase 8+). Phase 7 dùng mock data nên xem được ngay.

## Cấu trúc
```
src/
├── app/
│   ├── layout.tsx            # root: font Be Vietnam Pro + QueryProvider + Toaster
│   ├── globals.css
│   ├── not-found.tsx         # trang 404
│   └── (main)/               # nhóm route có Header + Footer
│       ├── layout.tsx
│       ├── page.tsx          # TRANG CHỦ (hero + flash sale + nổi bật)
│       └── sap-co/page.tsx   # giữ chỗ tính năng ngoài MVP
├── components/
│   ├── layout/   Header, CategoryMenu (mega-menu), MobileMenu, Footer
│   ├── home/     HeroBanner (Swiper), FlashSale, CategorySidebar, FeaturedProducts
│   ├── product/  ProductCard (default + flash)
│   ├── ui/       Container, StarRating, ProductImage
│   └── providers/ QueryProvider
├── stores/       authStore, cartStore, compareStore, notificationStore (Zustand + persist)
├── lib/          api.ts (axios + JWT refresh), utils.ts, constants.ts
├── hooks/        useCountdown.ts
├── data/         mock.ts (dữ liệu mẫu Phase 7)
└── types/        index.ts
```

## Hệ màu (design system)
| Token | Mã | Dùng cho |
|---|---|---|
| `primary` | `#2563EB` | nút, link, logo |
| `sale` | `#EF4444` | badge giảm giá, giá flash |
| `flash-gradient` | cam→đỏ | nút & thanh flash-sale |
| `footer` | `#1E293B` | nền footer |

## Quy ước
- Không dùng `any`. Không inline style — chỉ Tailwind.
- API URL lấy từ `process.env.NEXT_PUBLIC_API_URL`, không hardcode.
- Token lưu ở `authStore` (Zustand persist); axios tự gắn Bearer + refresh khi 401.
