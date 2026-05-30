'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
}

/** Ô nhập OTP nhiều hộp, tự nhảy ô + hỗ trợ dán. */
export function OtpInput({ value, onChange, length = 6, error }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (i: number, v: string) => {
    const digit = v.replace(/\D/g, '').slice(-1);
    const arr = value.split('');
    arr[i] = digit;
    onChange(arr.join('').slice(0, length));
    if (digit && i < length - 1) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const onPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (paste) {
      onChange(paste);
      refs.current[Math.min(paste.length, length - 1)]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={value[i] ?? ''}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          inputMode="numeric"
          maxLength={1}
          className={cn(
            'h-12 w-12 rounded-lg border text-center text-lg font-semibold focus:outline-none focus:ring-1',
            error
              ? 'border-sale focus:ring-sale'
              : 'border-gray-300 focus:border-primary focus:ring-primary',
          )}
        />
      ))}
    </div>
  );
}
