import type { DanhMucNav } from '@/types';

/**
 * Cây danh mục tĩnh cho mega-menu Header — slug KHỚP DB thật (V5 seed).
 * (8B-2 sẽ chuyển sang lấy động từ /api/danh-muc.)
 */
export const DANH_MUC_NAV: DanhMucNav[] = [
  { id: 'laptop', ten: 'Laptop' },
  { id: 'pc-gaming', ten: 'PC Gaming' },
  { id: 'man-hinh', ten: 'Màn hình' },
  {
    id: 'linh-kien',
    ten: 'Linh kiện',
    children: [
      { id: 'ram', ten: 'RAM' },
      { id: 'ssd', ten: 'SSD' },
      { id: 'card-do-hoa', ten: 'Card đồ họa' },
      { id: 'cpu', ten: 'CPU' },
    ],
  },
  {
    id: 'phu-kien',
    ten: 'Phụ kiện',
    children: [
      { id: 'chuot', ten: 'Chuột' },
      { id: 'ban-phim', ten: 'Bàn phím' },
      { id: 'tai-nghe', ten: 'Tai nghe' },
    ],
  },
];

/** Danh mục nhanh ở sidebar trang chủ (icon tròn). */
export const DANH_MUC_SIDEBAR = [
  { id: 'laptop', ten: 'Laptop', icon: 'Laptop' },
  { id: 'pc-gaming', ten: 'PC Gaming', icon: 'Gamepad2' },
  { id: 'man-hinh', ten: 'Màn hình', icon: 'Monitor' },
  { id: 'linh-kien', ten: 'Linh kiện', icon: 'Cpu' },
  { id: 'phu-kien', ten: 'Phụ kiện', icon: 'Mouse' },
] as const;

/** 6 tab trạng thái đơn (khóa cứng MVP). value rỗng = tất cả. */
export const ORDER_TABS = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ xử lý', value: 'CHO_XU_LY' },
  { label: 'Đang giao', value: 'DANG_GIAO' },
  { label: 'Giao thành công', value: 'GIAO_THANH_CONG' },
  { label: 'Hoàn thành', value: 'HOAN_THANH' },
  { label: 'Đã hủy', value: 'DA_HUY' },
] as const;

/** Nhãn + màu cho trạng thái đơn. */
export const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  CHO_THANH_TOAN: { label: 'Chờ thanh toán', color: 'text-amber-600' },
  CHO_XU_LY: { label: 'Chờ xử lý', color: 'text-amber-600' },
  DANG_GIAO: { label: 'Đang giao hàng', color: 'text-blue-600' },
  GIAO_THANH_CONG: { label: 'Giao thành công', color: 'text-green-600' },
  HOAN_THANH: { label: 'Hoàn thành', color: 'text-green-700' },
  DA_HUY: { label: 'Đã hủy', color: 'text-gray-500' },
};

/** Tùy chọn sắp xếp — KHỚP sortBy backend hỗ trợ (newest/rating/sold). */
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'sold', label: 'Bán chạy' },
] as const;

/** Cấu hình menu tài khoản (sidebar). `stub: true` = tính năng ngoài MVP → trang "Sắp có". */
export const ACCOUNT_MENU = [
  { id: 'tai-khoan', ten: 'Tài khoản của tôi', icon: 'User', href: '/tai-khoan' },
  { id: 'dia-chi', ten: 'Sổ địa chỉ', icon: 'MapPin', href: '/so-dia-chi' },
  { id: 'don-hang', ten: 'Lịch sử mua hàng', icon: 'ShoppingBag', href: '/lich-su-mua-hang' },
  { id: 'tu-van-ai', ten: 'Lịch sử tư vấn AI', icon: 'MessageSquare', href: '/sap-co', stub: true },
  { id: 'danh-gia', ten: 'Đánh giá sản phẩm', icon: 'Star', href: '/danh-gia' },
] as const;

/** Tra tên hiển thị danh mục theo slug (tìm cả cấp con). */
export function timTenDanhMuc(slug: string): string {
  for (const dm of DANH_MUC_NAV) {
    if (dm.id === slug) return dm.ten;
    const con = dm.children?.find((c) => c.id === slug);
    if (con) return con.ten;
  }
  return 'Sản phẩm';
}

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
