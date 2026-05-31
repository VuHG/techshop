'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X } from 'lucide-react';
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
  /** true = trang khuyến mãi: chỉ biến thể có giá bán < giá niêm yết. */
  khuyenMai?: boolean;
}

const PAGE_SIZE = 12;

export function ProductListing({ title, danhMucSlug, search, khuyenMai }: ProductListingProps) {
  const router = useRouter();
  const [phanLoaiId, setPhanLoaiId] = useState<number | undefined>();
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<SortValue>('newest');
  const [thongSo, setThongSo] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const [moBoLoc, setMoBoLoc] = useState(false); // drawer lọc trên mobile

  // Cây danh mục cho khối "Lọc danh mục".
  const { data: danhMucList } = useQuery({
    queryKey: ['cay-danh-muc'],
    queryFn: productService.getCayDanhMuc,
    staleTime: 5 * 60 * 1000,
  });

  // Phân loại thuộc danh mục đang xem ("Chọn sản phẩm").
  const { data: phanLoaiList, isSuccess: phanLoaiDaTai } = useQuery({
    queryKey: ['phan-loai', danhMucSlug],
    queryFn: () => productService.getPhanLoai(danhMucSlug as string),
    enabled: !!danhMucSlug,
  });

  // Danh mục có slug nhưng không còn phân loại nào (vd Linh kiện/Phụ kiện sau V10)
  // → coi là rỗng, KHÔNG fetch toàn bộ sản phẩm.
  const danhMucRong = !!danhMucSlug && phanLoaiDaTai && (phanLoaiList?.length ?? 0) === 0;

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
    queryKey: ['san-pham', { phanLoaiId, search, minPrice, maxPrice, sortBy, thongSoParam, khuyenMai, page }],
    queryFn: () =>
      productService.getSanPham({
        phanLoaiId,
        search,
        minPrice,
        maxPrice,
        sortBy,
        thongSo: thongSoParam,
        khuyenMai,
        page,
        size: PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
    enabled: !danhMucRong,
  });

  // Filter-schema cho khối "Lọc theo tiêu chí". Nhiều phân loại chưa có schema → bỏ qua lỗi.
  const { data: schema } = useQuery({
    queryKey: ['filter-schema', phanLoaiId],
    queryFn: () => productService.getFilterSchema(phanLoaiId as number),
    enabled: !!phanLoaiId,
    retry: false,
  });

  const resetPage = () => setPage(0);

  // Props dùng chung cho FilterSidebar ở cả 2 chế độ (desktop + drawer mobile).
  const filterProps = {
    danhMucList: danhMucList ?? [],
    danhMucSlug,
    onChonDanhMuc: (slug: string) => {
      router.push(`/danh-muc/${slug}`);
      setMoBoLoc(false);
    },
    phanLoaiList: phanLoaiList ?? [],
    phanLoaiId,
    onChonPhanLoai: (id: number) => {
      setPhanLoaiId(id);
      setThongSo({}); // tiêu chí phụ thuộc phân loại → reset khi đổi
      resetPage();
    },
    minPrice,
    maxPrice,
    onApplyGia: (mn?: number, mx?: number) => {
      setMinPrice(mn);
      setMaxPrice(mx);
      resetPage();
    },
    sortBy,
    onSort: (s: SortValue) => {
      setSortBy(s);
      resetPage();
    },
    schema,
    thongSo,
    onChonTieuChi: (key: string, value: string) => {
      setThongSo((prev) => {
        const next = { ...prev };
        if (value) next[key] = value;
        else delete next[key];
        return next;
      });
      resetPage();
    },
    onXoaTatCa: () => {
      setMinPrice(undefined);
      setMaxPrice(undefined);
      setThongSo({});
      resetPage();
    },
  };

  return (
    <Container className="py-5">
      <div className="flex gap-5">
        {/* Bộ lọc desktop (ẩn trên mobile, lg:block) */}
        <FilterSidebar {...filterProps} />

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{data?.totalElements ?? 0} sản phẩm</span>
              {/* Nút mở bộ lọc — chỉ hiện trên mobile/tablet (<lg) */}
              <button
                type="button"
                onClick={() => setMoBoLoc(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Bộ lọc
              </button>
            </div>
          </div>

          {danhMucRong ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
              <p className="text-gray-500">Danh mục đang cập nhật sản phẩm.</p>
              <p className="mt-1 text-sm text-gray-400">Vui lòng quay lại sau nhé!</p>
            </div>
          ) : (
            <>
              <ProductGrid items={data?.items ?? []} loading={isLoading} error={isError} />

              {data && data.totalPages > 1 && (
                <Pagination currentPage={data.currentPage} totalPages={data.totalPages} onChange={setPage} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Drawer bộ lọc trên mobile */}
      {moBoLoc && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMoBoLoc(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-xs flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h2 className="text-base font-semibold text-gray-800">Bộ lọc</h2>
              <button
                type="button"
                onClick={() => setMoBoLoc(false)}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Đóng bộ lọc"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FilterSidebar {...filterProps} asDrawer />
            </div>
            <div className="border-t border-gray-100 p-3">
              <button
                type="button"
                onClick={() => setMoBoLoc(false)}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
              >
                Xem {data?.totalElements ?? 0} sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
