// Kiểu dữ liệu dùng chung toàn frontend TechShop.

export interface NguoiDung {
  id: number;
  hoTen: string;
  soDienThoai: string;
  email: string | null;
  vaiTro: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Envelope response chuẩn của backend.
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface ApiError {
  success: false;
  errorCode: string;
  message: string;
  timestamp: string;
}

export interface PageResult<T> {
  items: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
}

export interface SanPham {
  id: number;
  slug: string;
  tenSanPham: string;
  giaBan: number;
  giaGoc?: number;
  phanTramGiam?: number;
  diemDanhGiaTb: number;
  soLuotDanhGia: number;
  duongDanAnhChinh: string | null;
  noiBat?: boolean;
  // Dùng cho flash-sale (hiển thị FE, không có logic backend)
  daBan?: number;
  tongSoLuong?: number;
}

export interface DanhMucNav {
  id: string;
  ten: string;
  children?: DanhMucNav[];
}
