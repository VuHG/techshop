import { ORDER_STATUS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function OrderStatusBadge({ trangThai, className }: { trangThai: string; className?: string }) {
  const s = ORDER_STATUS[trangThai] ?? { label: trangThai, color: 'text-gray-500' };
  return <span className={cn('font-medium', s.color, className)}>Trạng thái: {s.label}</span>;
}
