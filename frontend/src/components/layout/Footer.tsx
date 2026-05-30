import Link from 'next/link';
import { Code2, MapPin, Phone, Mail } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { FOOTER_LINKS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="mt-12 bg-footer text-gray-300">
      <Container className="grid grid-cols-1 gap-8 py-10 md:grid-cols-2 lg:grid-cols-4">
        {/* Cột thương hiệu */}
        <div>
          <Link href="/" className="mb-3 flex items-center gap-1.5 text-white">
            <Code2 className="h-6 w-6" />
            <span className="text-lg font-bold">TechShop</span>
          </Link>
          <p className="text-sm leading-relaxed text-gray-400">
            Cửa hàng công nghệ uy tín — laptop, PC, linh kiện và phụ kiện chính hãng.
          </p>
        </div>

        {/* Về TechShop */}
        <FooterCol tieuDe={FOOTER_LINKS.veTechShop.tieuDe} links={FOOTER_LINKS.veTechShop.links} />

        {/* Hỗ trợ khách hàng */}
        <FooterCol tieuDe={FOOTER_LINKS.hoTro.tieuDe} links={FOOTER_LINKS.hoTro.links} />

        {/* Liên hệ */}
        <div>
          <h3 className="mb-3 font-semibold text-white">Thông tin liên hệ</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              Số 123, đường ABC, Quận XYZ, TP. Hồ Chí Minh
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              1900 1234
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              support@techshop.vn
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} TechShop. Đồ án tốt nghiệp.
      </div>
    </footer>
  );
}

function FooterCol({ tieuDe, links }: { tieuDe: string; links: string[] }) {
  return (
    <div>
      <h3 className="mb-3 font-semibold text-white">{tieuDe}</h3>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l}>
            <Link href="#" className="text-gray-400 transition hover:text-white">
              {l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
