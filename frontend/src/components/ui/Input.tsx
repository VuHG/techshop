import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...rest }, ref) => (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-1',
          error
            ? 'border-sale focus:border-sale focus:ring-sale'
            : 'border-gray-300 focus:border-primary focus:ring-primary',
          className,
        )}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-sale">{error}</p>}
    </div>
  ),
);

Input.displayName = 'Input';
