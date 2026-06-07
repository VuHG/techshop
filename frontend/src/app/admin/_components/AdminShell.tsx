'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';

/** Khung admin có responsive: sidebar cố định trên desktop, drawer trên mobile. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const [moDrawer, setMoDrawer] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar desktop */}
      <AdminSidebar className="hidden lg:flex" />

      {/* Drawer mobile */}
      {moDrawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMoDrawer(false)} />
          <AdminSidebar
            className="absolute left-0 top-0 h-full shadow-xl"
            onNavigate={() => setMoDrawer(false)}
          />
          <button
            onClick={() => setMoDrawer(false)}
            className="absolute right-4 top-4 rounded-lg bg-white/90 p-2 text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar (hamburger) chỉ hiện trên mobile */}
        <header className="flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:hidden print:hidden">
          <button onClick={() => setMoDrawer(true)} className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-lg font-bold text-primary">TechAdmin</span>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
