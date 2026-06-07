import { Check, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Các bước chính của đơn (không gồm Đã hủy). */
const STEPS = [
  { value: 'CHO_XU_LY', label: 'Chờ xử lý' },
  { value: 'DA_DUYET', label: 'Chờ lấy hàng' },
  { value: 'DANG_GIAO', label: 'Đang giao' },
  { value: 'GIAO_THANH_CONG', label: 'Đã giao' },
  { value: 'HOAN_THANH', label: 'Hoàn thành' },
];

/**
 * Sơ đồ tiến trình trạng thái đơn. Các bước đã qua + bước hiện tại tích V xanh.
 * Đơn "Đã hủy" → không tích bước nào, hiển thị tag Đã hủy.
 */
export function OrderStatusStepper({ trangThai }: { trangThai: string }) {
  const daHuy = trangThai === 'DA_HUY';
  const currentIndex = STEPS.findIndex((s) => s.value === trangThai);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Tiến trình đơn hàng</h2>
        {daHuy && (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            <XCircle className="h-3.5 w-3.5" /> Đã hủy
          </span>
        )}
      </div>

      <div className={cn('flex items-start', daHuy && 'opacity-50')}>
        {STEPS.map((step, i) => {
          const done = !daHuy && currentIndex >= 0 && i <= currentIndex;
          const isLast = i === STEPS.length - 1;
          return (
            <div key={step.value} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <div className="flex-1">
                  {i > 0 && (
                    <div className={cn('h-0.5 w-full', done ? 'bg-green-500' : 'bg-gray-200')} />
                  )}
                </div>
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
                    done
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 bg-white text-gray-400',
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <div className="flex-1">
                  {!isLast && (
                    <div
                      className={cn(
                        'h-0.5 w-full',
                        !daHuy && currentIndex > i ? 'bg-green-500' : 'bg-gray-200',
                      )}
                    />
                  )}
                </div>
              </div>
              <span
                className={cn(
                  'mt-2 text-center text-xs',
                  done ? 'font-medium text-gray-900' : 'text-gray-400',
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
