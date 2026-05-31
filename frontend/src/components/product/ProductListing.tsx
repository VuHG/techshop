'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import { Container } from '@/components/ui/Container';
import { FilterSidebar } from './FilterSidebar';
import { ProductGrid } from './ProductGrid';
import { Pagination } from './Pagination';
import type { SortValue } from './SortSelect';

interface ProductListingProps {
  title: string;
  danhMucSlug?: string;
  search?: string;
}

const PAGE_SIZE = 12;

export function ProductListing({ title, danhMucSlug, search }: ProductListingProps) {
  const router = useRouter();
  const [phanLoaiId, setPhanLoaiId] = useState<number | undefined>();
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<SortValue>('newest');
  const [thongSo, setThongSo] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);

  // Cây danh mục cho khối "Lọc danh mục".
  const { data: danhMucList } = useQuery({
    queryKey: ['cay-danh-muc'],
    queryFn: productService.getCayDanhMuc,
    staleTime: 5 * 60 * 1000,
  });

  // Phân loại thuộc danh mục đang xem ("Chọn sản phẩm").
  const { data: phanLoaiList } = useQuery({
    queryKey: ['phan-loai', danhMucSlug],
    queryFn: () => productService.getPhanLoai(danhMucSlug as string),
    enabled: !!danhMucSlug,
  });

  // Đổi danh mục (qua route) → reset phân loại + tiêu chí + trang.
  useEffect(() => {
    setPhanLoaiId(undefined);
    setThongSo({});
    setPage(0);
  }, [danhMucSlug]);

  // Tự chọn phân loại đầu tiên khi danh mục có phân loại.
  useEffect(() => {
    if (danhMucSlug && phanLoaiList && phanLoaiList.length > 0 && phanLoaiId === undefined) {
      setPhanLoaiId(phanLoaiList[0].id);
    }
  }, [phanLoaiList, danhMucSlug, phanLoaiId]);

  // Tiêu chí gửi backend dưới dạng chuỗi JSON ({"ram":"16GB",...}); rỗng → undefined.
  const thongSoParam =
    Object.keys(thongSo).length > 0 ? JSON.stringify(thongSo) : undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['san-pham', { phanLoaiId, search, minPrice, maxPrice, sortBy, thongSoParam, page }],
    queryFn: () =>
      productService.getSanPham({
        phanLoaiId,
        search,
        minPrice,
        maxPrice,
        sortBy,
        thongSo: thongSoParam,
        page,
        size: PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
  });

  // Filter-schema cho khối "Lọc theo tiêu chí". Nhiều phân loại chưa có schema → bỏ qua lỗi.
  const { data: schema } = useQuery({
    queryKey: ['filter-schema', phanLoaiId],
    queryFn: () => productService.getFilterSchema(phanLoaiId as number),
    enabled: !!phanLoaiId,
    retry: false,
  });

  const resetPage = () => setPage(0);

  return (
    <Container className="py-5">
      <div className="flex gap-5">
        <FilterSidebar
          danhMucList={danhMucList ?? []}
          danhMucSlug={danhMucSlug}
          onChonDanhMuc={(slug) => router.push(`/danh-muc/${slug}`)}
          phanLoaiList={phanLoaiList ?? []}
          phanLoaiId={phanLoaiId}
          onChonPhanLoai={(id) => {
            setPhanLoaiId(id);
            setThongSo({}); // tiêu chí phụ thuộc phân loại → reset khi đổi
            resetPage();
          }}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onApplyGia={(mn, mx) => {
            setMinPrice(mn);
            setMaxPrice(mx);
            resetPage();
          }}
          sortBy={sortBy}
          onSort={(s) => {
            setSortBy(s);
            resetPage();
          }}
          schema={schema}
          thongSo={thongSo}
          onChonTieuChi={(key, value) => {
            setThongSo((prev) => {
              const next = { ...prev };
              if (value) next[key] = value;
              else delete next[key];
              return next;
            });
            resetPage();
          }}
          onXoaTatCa={() => {
            setMinPrice(undefined);
            setMaxPrice(undefined);
            setThongSo({});
            resetPage();
          }}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
            <span className="text-sm text-gray-500">{data?.totalElements ?? 0} sản phẩm</span>
          </div>

          <ProductGrid items={data?.items ?? []} loading={isLoading} error={isError} />

          {data && data.totalPages > 1 && (
            <Pagination currentPage={data.currentPage} totalPages={data.totalPages} onChange={setPage} />
          )}
        </div>
      </div>
    </Container>
  );
}
