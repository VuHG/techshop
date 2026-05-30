import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Gộp class Tailwind, xử lý xung đột (vd p-2 vs p-4). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Định dạng giá tiền VND: 25990000 -> "25.990.000đ". */
export function formatPrice(value: number): string {
  return `${value.toLocaleString('vi-VN')}đ`;
}

/** Phần trăm giảm giá giữa giá gốc và giá bán. */
export function tinhPhanTramGiam(giaGoc: number, giaBan: number): number {
  if (!giaGoc || giaGoc <= giaBan) return 0;
  return Math.round(((giaGoc - giaBan) / giaGoc) * 100);
}

/** Giá hiệu lực của một biến thể (ưu tiên giá khuyến mãi). */
export function giaBienThe(bt: { gia: number; giaKhuyenMai: number | null }): number {
  return bt.giaKhuyenMai ?? bt.gia;
}

/** Giá thấp nhất trong danh sách biến thể. */
export function giaThapNhat(bienThes: { gia: number; giaKhuyenMai: number | null }[]): number | null {
  if (bienThes.length === 0) return null;
  return Math.min(...bienThes.map(giaBienThe));
}

/** Định dạng ngày: ISO -> "dd/MM/yyyy" theo vi-VN. */
export function formatNgay(iso: string): string {
  return new Date(iso).toLocaleDateString('vi-VN');
}

/** Nhãn thông số: "man_hinh" -> "Man hinh". */
export function nhanThongSo(key: string): string {
  return key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
}
