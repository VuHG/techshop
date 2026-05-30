import Link from 'next/link';
import { Construction } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export const metadata = { title: 'Sắp có' };

// Trang giữ chỗ cho các tính năng ngoài MVP (đăng nhập MXH, ví, lịch sử tư vấn AI...).
export default function SapCoPage() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <Construction className="h-16 w-16 text-primary" />
      <h1 className="mt-4 text-2xl font-bold text-gray-800">Tính năng sắp ra mắt</h1>
      <p className="mt-2 max-w-md text-gray-500">
        Chúng tôi đang hoàn thiện tính năng này. Vui lòng quay lại sau nhé!
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
      >
        Về trang chủ
      </Link>
    </Container>
  );
}
