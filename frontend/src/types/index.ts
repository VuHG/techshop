// Kiểu dữ liệu dùng chung — KHỚP đúng DTO backend (module auth + product).

// ─── Chung ───────────────────────────────────────────────
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

// Khớp PageResponse<T> của backend.
export interface PageResult<T> {
  items: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
}

// ─── Auth ────────────────────────────────────────────────
export interface NguoiDung {
  id: number;
  hoTen: string;
  soDienThoai: string;
  email: string | null;
  ngaySinh: string | null; // ISO date (LocalDate)
  vaiTro: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends AuthTokens {
  nguoiDung: NguoiDung;
}

// ─── Product ─────────────────────────────────────────────
export interface Nhan {
  id: number;
  tenNhan: string;
  mauSac: string;
}

export interface Anh {
  id: number;
  urlAnh: string;
  laAnhChinh: boolean;
  thuTu: number | null;
}

export interface SanPhamCard {
  id: number;
  slug: string;
  tenSanPham: string;
  moTaNgan: string | null;
  thuongHieu: string | null;
  giaThap: number | null;
  giaCao: number | null;
  diemDanhGiaTb: number;
  soLuotDanhGia: number;
  anhChinh: string | null;
  nhans: Nhan[];
}

export interface BienThe {
  id: number;
  maBienThe: string;
  thongSoBienThe: Record<string, unknown>;
  gia: number;
  giaKhuyenMai: number | null;
  soLuongTon: number;
  trangThai: string;
  anhs: Anh[];
  nhans: Nhan[];
}

export interface SanPhamDetail {
  id: number;
  slug: string;
  tenSanPham: string;
  moTa: string | null;
  moTaNgan: string | null;
  thuongHieu: string | null;
  phanLoaiId: number;
  thongSoKyThuat: Record<string, unknown>;
  diemDanhGiaTb: number;
  soLuotDanhGia: number;
  soLuotBan: number;
  bienThes: BienThe[];
  sanPhamTuongTu: SanPhamCard[];
}

export interface Suggest {
  id: number;
  slug: string;
  tenSanPham: string;
  anhChinh: string | null;
  giaThap: number | null;
}

export interface DanhMuc {
  id: number;
  tenDanhMuc: string;
  slug: string;
  thuTuHienThi: number | null;
  danhMucCon: DanhMuc[];
}

export interface PhanLoai {
  id: number;
  tenPhanLoai: string;
  danhMucId: number;
}

export interface DanhGia {
  id: number;
  sanPhamId: number;
  donHangId: number;
  diem: number;
  noiDung: string;
  ngayTao: string;
}

// ─── Cart / Discount / Order / Profile (Phase 9) ─────────
export interface GioHangItem {
  id: number;
  bienTheId: number;
  sanPhamId: number;
  slug: string;
  tenSanPham: string;
  thongSoBienThe: Record<string, unknown>;
  anhChinh: string | null;
  gia: number;
  soLuong: number;
  soLuongTon: number;
  thanhTien: number;
  conHang: boolean;
}

export interface GioHang {
  items: GioHangItem[];
  tongSoLuong: number;
  tongTien: number;
}

export interface DiscountResult {
  maGiamGiaId: number;
  maCode: string;
  tenMa: string;
  loaiGiam: string;
  tienGiam: number;
  tongThanhToanSauGiam: number;
}

export interface ChiTietDonHang {
  bienTheId: number;
  tenSanPham: string;
  thongSoBienThe: Record<string, unknown>;
  duongDanAnhChinh: string | null;
  giaLucMua: number;
  soLuong: number;
  thanhTien: number;
}

export interface TrangThaiDonHang {
  trangThai: string;
  ghiChu: string | null;
  ngayTao: string;
}

export interface DonHang {
  id: number;
  maDonHang: string;
  trangThai: string;
  hoTenNguoiNhan: string;
  soDienThoaiNhan: string;
  diaChiGiaoHang: string;
  phuongThucThanhToan: string;
  tongTienHang: number;
  tienGiamGia: number;
  phiVanChuyen: number;
  tongThanhToan: number;
  ghiChu: string | null;
  ngayTao: string;
  items: ChiTietDonHang[];
  lichSu: TrangThaiDonHang[];
}

export interface DonHangSummary {
  id: number;
  maDonHang: string;
  trangThai: string;
  tongThanhToan: number;
  soLuongSanPham: number;
  tenSanPhamDau: string;
  anhDaiDien: string | null;
  ngayTao: string;
}

export interface DiaChi {
  id: number;
  hoTenNguoiNhan: string;
  soDienThoai: string;
  diaChiChiTiet: string;
  phuongXa: string;
  quanHuyen: string;
  tinhThanh: string;
  laMacDinh: boolean;
  diaChiDayDu: string;
}

export interface Profile {
  id: number;
  hoTen: string;
  soDienThoai: string;
  email: string | null;
  ngaySinh: string | null;
  vaiTro: string;
}

// Filter schema JSONB (chi_tiet_thuoc_tinh_loc) — cấu trúc động.
export type FilterSchema = Record<string, unknown>;

// Danh mục điều hướng tĩnh cho mega-menu.
export interface DanhMucNav {
  id: string;
  ten: string;
  children?: DanhMucNav[];
}
