'use client';

import { useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Dải cuộn ngang cho phép KÉO (drag) bằng chuột trái/phải.
 * Vẫn cuộn được bằng trackpad/touch. Nếu kéo (di chuyển > 5px) thì chặn click
 * để không vô tình mở link sản phẩm khi đang kéo.
 */
export function DragScroll({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const start = useRef({ x: 0, left: 0 });
  const moved = useRef(false);

  const onDown = (e: React.MouseEvent) => {
    if (!ref.current) return;
    setDragging(true);
    moved.current = false;
    start.current = { x: e.pageX, left: ref.current.scrollLeft };
  };

  const onMove = (e: React.MouseEvent) => {
    if (!dragging || !ref.current) return;
    const delta = e.pageX - start.current.x;
    if (Math.abs(delta) > 5) moved.current = true;
    ref.current.scrollLeft = start.current.left - delta;
  };

  const stop = () => setDragging(false);

  const onClickCapture = (e: React.MouseEvent) => {
    if (moved.current) {
      e.preventDefault();
      e.stopPropagation();
      moved.current = false;
    }
  };

  return (
    <div
      ref={ref}
      onMouseDown={onDown}
      onMouseMove={onMove}
      onMouseUp={stop}
      onMouseLeave={stop}
      onClickCapture={onClickCapture}
      className={cn(
        'no-scrollbar flex gap-3 overflow-x-auto',
        dragging ? 'cursor-grabbing select-none' : 'cursor-grab',
        className,
      )}
    >
      {children}
    </div>
  );
}
