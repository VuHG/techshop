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
