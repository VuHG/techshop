import type { Tone } from '../_components/StatusBadge';

/** Nhãn + màu cho từng trạng thái đơn (khớp DB). */
export const ORDER_STATUS: Record<string, { label: string; tone: Tone }> = {
  CHO_THANH_TOAN: { label: 'Chờ thanh toán', tone: 'gray' },
  CHO_XU_LY: { label: 'Chờ xử lý', tone: 'amber' },
  DA_DUYET: { label: 'Chờ lấy hàng', tone: 'blue' },
  DANG_GIAO: { label: 'Đang giao', tone: 'violet' },
  GIAO_THANH_CONG: { label: 'Đã giao', tone: 'green' },
  HOAN_THANH: { label: 'Hoàn thành', tone: 'green' },
  DA_HUY: { label: 'Đã hủy', tone: 'red' },
};

export function nhanTrangThai(tt: string): { label: string; tone: Tone } {
  return ORDER_STATUS[tt] ?? { label: tt, tone: 'gray' };
}

/** Các tab lọc trên trang danh sách (value rỗng = tất cả). */
export const ORDER_TABS: { value: string; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'CHO_XU_LY', label: 'Chờ xử lý' },
  { value: 'DA_DUYET', label: 'Chờ lấy hàng' },
  { value: 'DANG_GIAO', label: 'Đang giao' },
  { value: 'GIAO_THANH_CONG', label: 'Đã giao' },
  { value: 'HOAN_THANH', label: 'Hoàn thành' },
  { value: 'DA_HUY', label: 'Đã hủy' },
];
