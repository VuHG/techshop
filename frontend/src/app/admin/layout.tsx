import { AdminProtectedRoute } from './_components/AdminProtectedRoute';
import { AdminShell } from './_components/AdminShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProtectedRoute>
      <AdminShell>{children}</AdminShell>
    </AdminProtectedRoute>
  );
}
