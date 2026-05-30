import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Khung nội dung canh giữa, rộng tối đa 1280px. */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('mx-auto w-full max-w-7xl px-4', className)}>{children}</div>;
}
