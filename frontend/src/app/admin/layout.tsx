import { AdminProtectedRoute } from './_components/AdminProtectedRoute';
import { AdminSidebar } from './_components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 overflow-x-hidden p-6">{children}</main>
      </div>
    </AdminProtectedRoute>
  );
}
