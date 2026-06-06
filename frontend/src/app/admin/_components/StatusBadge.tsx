import { cn } from '@/lib/utils';

type Tone = 'gray' | 'blue' | 'green' | 'amber' | 'red' | 'violet';

const TONE: Record<Tone, string> = {
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  violet: 'bg-violet-100 text-violet-700',
};

/** Pill trạng thái dùng chung trong admin. */
export function StatusBadge({ label, tone = 'gray' }: { label: string; tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        TONE[tone],
      )}
    >
      {label}
    </span>
  );
}

export type { Tone };
