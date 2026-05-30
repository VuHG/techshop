'use client';

import { useEffect, useState } from 'react';
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
  const [phanLoaiId, setPhanLoaiId] = useState<number | undefined>();
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<SortValue>('newest');
  const [page, setPage] = useState(0);

  // Phân loại thuộc danh mục (để hiện chip chọn).
  const { data: phanLoaiList } = useQuery({
    queryKey: ['phan-loai', danhMucSlug],
    queryFn: () => productService.getPhanLoai(danhMucSlug as string),
    enabled: !!danhMucSlug,
  });

  // Tự chọn phân loại đầu tiên khi danh mục có phân loại.
  useEffect(() => {
    if (danhMucSlug && phanLoaiList && phanLoaiList.length > 0 && phanLoaiId === undefined) {
      setPhanLoaiId(phanLoaiList[0].id);
    }
  }, [phanLoaiList, danhMucSlug, phanLoaiId]);

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['san-pham', { phanLoaiId, search, minPrice, maxPrice, sortBy, page }],
    queryFn: () =>
      productService.getSanPham({
        phanLoaiId,
        search,
        minPrice,
        maxPrice,
        sortBy,
        page,
        size: PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
  });

  // Filter-schema cho khối "lọc nâng cao" (chỉ hiển thị). Nhiều phân loại không có → bỏ qua lỗi.
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
          phanLoaiList={phanLoaiList ?? []}
          phanLoaiId={phanLoaiId}
          onChonPhanLoai={(id) => {
            setPhanLoaiId(id);
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
          onXoaTatCa={() => {
            setMinPrice(undefined);
            setMaxPrice(undefined);
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
