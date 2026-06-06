import type { Tone } from '../_components/StatusBadge';

export const DISCOUNT_STATUS: Record<string, { label: string; tone: Tone }> = {
  DANG_DIEN_RA: { label: 'Đang diễn ra', tone: 'green' },
  SAP_TOI: { label: 'Sắp tới', tone: 'blue' },
  DA_KET_THUC: { label: 'Đã kết thúc', tone: 'gray' },
  VO_HIEU: { label: 'Vô hiệu', tone: 'red' },
};

export function nhanTinhTrang(tt: string): { label: string; tone: Tone } {
  return DISCOUNT_STATUS[tt] ?? { label: tt, tone: 'gray' };
}

export const DISCOUNT_TABS: { value: string; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'DANG_DIEN_RA', label: 'Đang diễn ra' },
  { value: 'SAP_TOI', label: 'Sắp tới' },
  { value: 'DA_KET_THUC', label: 'Đã kết thúc' },
  { value: 'VO_HIEU', label: 'Vô hiệu' },
];

/** ISO → giá trị cho input datetime-local (yyyy-MM-ddTHH:mm theo giờ địa phương). */
export function isoToLocalInput(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

/** Giá trị input datetime-local → ISO (UTC) cho backend. */
export function localInputToIso(value: string): string {
  return new Date(value).toISOString();
}
