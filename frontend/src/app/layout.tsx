import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { QueryProvider } from '@/components/providers/QueryProvider';
import './globals.css';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'TechShop — Cửa hàng công nghệ',
    template: '%s | TechShop',
  },
  description: 'Mua laptop, PC, linh kiện và phụ kiện công nghệ chính hãng tại TechShop.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body className="font-sans">
        <QueryProvider>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </QueryProvider>
      </body>
    </html>
  );
}
