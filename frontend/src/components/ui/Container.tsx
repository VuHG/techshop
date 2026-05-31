import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Khung nội dung canh giữa — thu hẹp lại + chừa lề trái/phải rộng hơn trên màn lớn. */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-4 lg:px-10 xl:px-16', className)}>{children}</div>
  );
}
