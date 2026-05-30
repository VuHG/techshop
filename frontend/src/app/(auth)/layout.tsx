import Link from 'next/link';
import { Code2 } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-10">
      <Link href="/" className="mb-6 flex items-center gap-2 text-primary">
        <Code2 className="h-8 w-8" />
        <span className="text-2xl font-bold">TechShop</span>
      </Link>
      {children}
    </div>
  );
}
