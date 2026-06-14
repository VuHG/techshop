'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { queryClient } from '@/lib/queryClient';
import { GlobalLoadingCursor } from './GlobalLoadingCursor';

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalLoadingCursor />
      {children}
    </QueryClientProvider>
  );
}
