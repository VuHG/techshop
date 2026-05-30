import type { DanhMucNav } from '@/types';

/** Cây danh mục cho mega-menu Header (theo thiết kế). */
export const DANH_MUC_NAV: DanhMucNav[] = [
  { id: 'laptop', ten: 'Laptop' },
  { id: 'pc', ten: 'PC' },
  {
    id: 'linh-kien',
    ten: 'Linh kiện',
    children: [
      { id: 'linh-kien-laptop', ten: 'Linh kiện Laptop' },
      {
        id: 'linh-kien-pc',
        ten: 'Linh kiện PC',
        children: [
          { id: 'cpu-pc', ten: 'CPU PC' },
          { id: 'mainboard-pc', ten: 'Mainboard PC' },
          { id: 'ram-pc', ten: 'Ram PC' },
          { id: 'vga-pc', ten: 'VGA PC' },
          { id: 'ssd-pc', ten: 'Ổ cứng SSD PC' },
          { id: 'nguon-pc', ten: 'Nguồn PC' },
          { id: 'vo-case-pc', ten: 'Vỏ Case PC' },
          { id: 'tan-nhiet-pc', ten: 'Tản Nhiệt PC' },
          { id: 'card-wifi', ten: 'Card Wi-Fi/Bluetooth' },
        ],
      },
    ],
  },
  {
    id: 'phu-kien',
    ten: 'Phụ kiện',
    children: [
      { id: 'chuot', ten: 'Chuột' },
      { id: 'ban-phim', ten: 'Bàn Phím' },
      { id: 'lot-chuot', ten: 'Lót chuột' },
      { id: 'tai-nghe', ten: 'Tai nghe' },
      { id: 'loa', ten: 'Loa' },
      { id: 'webcam', ten: 'Webcam rời' },
      { id: 'microphone', ten: 'Microphone' },
      { id: 'hub-usb', ten: 'Hub USB' },
      { id: 'bo-thu-phat', ten: 'Bộ thu phát Wifi/Bluetooth' },
      { id: 'usb', ten: 'USB Flash Drive' },
    ],
  },
  { id: 'hang-cu', ten: 'Hàng cũ' },
];

/** Danh mục nhanh ở sidebar trang chủ (icon tròn). */
export const DANH_MUC_SIDEBAR = [
  { id: 'laptop', ten: 'Laptop', icon: 'Laptop' },
  { id: 'pc', ten: 'PC', icon: 'Monitor' },
  { id: 'linh-kien', ten: 'Linh kiện', icon: 'Cpu' },
  { id: 'phu-kien', ten: 'Phụ kiện', icon: 'Mouse' },
  { id: 'hang-cu', ten: 'Đồ cũ', icon: 'Recycle' },
] as const;

/** Cấu hình menu tài khoản (sidebar). `stub: true` = tính năng ngoài MVP, trỏ trang "Sắp có". */
export const ACCOUNT_MENU = [
  { id: 'tai-khoan', ten: 'Tài khoản của tôi', icon: 'User', href: '/tai-khoan' },
  { id: 'dia-chi', ten: 'Sổ địa chỉ', icon: 'MapPin', href: '/so-dia-chi' },
  { id: 'don-hang', ten: 'Lịch sử mua hàng', icon: 'ShoppingBag', href: '/lich-su-mua-hang' },
  { id: 'tu-van-ai', ten: 'Lịch sử tư vấn AI', icon: 'MessageSquare', href: '/sap-co', stub: true },
  { id: 'danh-gia', ten: 'Đánh giá sản phẩm', icon: 'Star', href: '/danh-gia' },
  { id: 'thong-bao', ten: 'Thông báo', icon: 'Bell', href: '/thong-bao' },
] as const;

export const FOOTER_LINKS = {
  veTechShop: {
    tieuDe: 'Về TechShop',
    links: ['Giới thiệu', 'Tuyển dụng', 'Chính sách bảo mật', 'Liên hệ'],
  },
  hoTro: {
    tieuDe: 'Hỗ trợ khách hàng',
    links: ['Hướng dẫn mua hàng', 'Phương thức thanh toán', 'Chính sách bảo hành', 'Câu hỏi thường gặp'],
  },
};
