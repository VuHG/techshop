'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { productService } from '@/services/productService';
import { ProductImage } from '@/components/ui/ProductImage';
import { formatPrice } from '@/lib/utils';

export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounce 600ms trước khi gọi gợi ý.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(q.trim()), 600);
    return () => clearTimeout(id);
  }, [q]);

  // Đóng dropdown khi click ra ngoài.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: suggests } = useQuery({
    queryKey: ['suggest', debounced],
    queryFn: () => productService.getSuggest(debounced),
    enabled: debounced.length >= 2,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = q.trim();
    if (t) {
      setOpen(false);
      router.push(`/tim-kiem?q=${encodeURIComponent(t)}`);
    }
  };

  const showDropdown = open && debounced.length >= 2 && !!suggests && suggests.length > 0;

  return (
    <div ref={boxRef} className="relative flex-1">
      <form onSubmit={submit}>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Tìm kiếm sản phẩm..."
          className="w-full rounded-full border border-gray-200 py-2 pl-4 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          aria-label="Tìm kiếm"
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-500 hover:text-primary"
        >
          <Search className="h-5 w-5" />
        </button>
      </form>

      {showDropdown && (
        <div className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
          {suggests.map((s) => (
            <Link
              key={s.id}
              // Bấm gợi ý → trang kết quả hiển thị TOÀN BỘ biến thể của sản phẩm (không nhảy thẳng vào 1 biến thể mặc định).
              href={`/tim-kiem?q=${encodeURIComponent(s.tenSanPham)}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50"
            >
              <ProductImage src={s.anhChinh} alt={s.tenSanPham} className="h-10 w-10 shrink-0 rounded" />
              <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{s.tenSanPham}</span>
              <span className="shrink-0 text-sm font-semibold text-primary">
                {s.giaThap != null ? formatPrice(s.giaThap) : ''}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
