'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Container } from '@/components/ui/Container';
import { AccountSidebar } from './AccountSidebar';

export function AccountShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Container className="py-5">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr]">
          <AccountSidebar />
          <div className="min-w-0">{children}</div>
        </div>
      </Container>
    </ProtectedRoute>
  );
}
