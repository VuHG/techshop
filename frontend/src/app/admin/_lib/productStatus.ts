import type { Tone } from '../_components/StatusBadge';

export const PRODUCT_STATUS: Record<string, { label: string; tone: Tone }> = {
  CON_HANG: { label: 'Đang bán', tone: 'green' },
  HET_HANG: { label: 'Hết hàng', tone: 'amber' },
  BAN_NHAP: { label: 'Bản nháp', tone: 'gray' },
  NGUNG_BAN: { label: 'Đã ẩn', tone: 'red' },
};

export function nhanTrangThaiSp(tt: string): { label: string; tone: Tone } {
  return PRODUCT_STATUS[tt] ?? { label: tt, tone: 'gray' };
}

export const PRODUCT_TABS: { value: string; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'CON_HANG', label: 'Đang bán' },
  { value: 'HET_HANG', label: 'Hết hàng' },
  { value: 'BAN_NHAP', label: 'Bản nháp' },
  { value: 'NGUNG_BAN', label: 'Đã ẩn' },
];

/** Trạng thái chọn được khi tạo/sửa sản phẩm. */
export const PRODUCT_STATUS_OPTIONS = [
  { value: 'CON_HANG', label: 'Đang bán' },
  { value: 'BAN_NHAP', label: 'Bản nháp' },
  { value: 'NGUNG_BAN', label: 'Đã ẩn' },
];

export const VARIANT_STATUS_OPTIONS = [
  { value: 'CON_HANG', label: 'Còn hàng' },
  { value: 'HET_HANG', label: 'Hết hàng' },
  { value: 'NGUNG_BAN', label: 'Ngừng bán' },
];
