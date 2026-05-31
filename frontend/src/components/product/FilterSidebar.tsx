'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import type { DanhMuc, FilterSchema, PhanLoai } from '@/types';
import { SortSelect, type SortValue } from './SortSelect';

interface FilterSidebarProps {
  danhMucList: DanhMuc[];
  danhMucSlug?: string;
  onChonDanhMuc: (slug: string) => void;
  phanLoaiList: PhanLoai[];
  phanLoaiId?: number;
  onChonPhanLoai: (id: number) => void;
  minPrice?: number;
  maxPrice?: number;
  onApplyGia: (min?: number, max?: number) => void;
  sortBy: SortValue;
  onSort: (s: SortValue) => void;
  schema?: FilterSchema;
  thongSo: Record<string, string>;
  onChonTieuChi: (key: string, value: string) => void;
  onXoaTatCa: () => void;
  /** true = render trong drawer mobile (bỏ ẩn lg, full width). */
  asDrawer?: boolean;
}

// Một tiêu chí lọc trong filter-schema JSONB.
interface TieuChi {
  label?: string;
  values?: string[];
}

// Dàn phẳng cây danh mục: cha (level 0) + con (level 1) để hiển thị danh sách chọn.
function flattenDanhMuc(list: DanhMuc[]): { slug: string; ten: string; level: number }[] {
  const out: { slug: string; ten: string; level: number }[] = [];
  for (const dm of list) {
    out.push({ slug: dm.slug, ten: dm.tenDanhMuc, level: 0 });
    for (const con of dm.danhMucCon ?? []) {
      out.push({ slug: con.slug, ten: con.tenDanhMuc, level: 1 });
    }
  }
  return out;
}

export function FilterSidebar({
  danhMucList,
  danhMucSlug,
  onChonDanhMuc,
  phanLoaiList,
  phanLoaiId,
  onChonPhanLoai,
  minPrice,
  maxPrice,
  onApplyGia,
  sortBy,
  onSort,
  schema,
  thongSo,
  onChonTieuChi,
  onXoaTatCa,
  asDrawer = false,
}: FilterSidebarProps) {
  const [tuGia, setTuGia] = useState('');
  const [denGia, setDenGia] = useState('');

  const apDungGia = () => {
    const mn = tuGia ? Number(tuGia) : undefined;
    const mx = denGia ? Number(denGia) : undefined;
    onApplyGia(mn, mx);
  };

  const dmFlat = flattenDanhMuc(danhMucList);
  const tieuChiList = schema ? Object.entries(schema) : [];
  const tieuChiDangChon = Object.entries(thongSo);
  const coDangLoc = minPrice != null || maxPrice != null || tieuChiDangChon.length > 0;

  return (
    <aside
      className={cn(
        asDrawer
          ? 'w-full p-4'
          : 'hidden w-56 shrink-0 rounded-xl border border-gray-100 bg-white p-4 lg:block',
      )}
    >
      {/* 1. Lọc danh mục — toàn bộ danh mục từ DB */}
      {dmFlat.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Lọc danh mục</h3>
          <ul className="space-y-0.5">
            {dmFlat.map((dm) => (
              <li key={dm.slug}>
                <button
                  type="button"
                  onClick={() => onChonDanhMuc(dm.slug)}
                  className={cn(
                    'block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-primary-50 hover:text-primary',
                    dm.level === 1 && 'pl-5',
                    dm.slug === danhMucSlug
                      ? 'bg-primary-50 font-medium text-primary'
                      : 'text-gray-700',
                  )}
                >
                  {dm.ten}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 2. Chọn sản phẩm — phân loại trong danh mục đang xem */}
      {phanLoaiList.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Chọn sản phẩm</h3>
          <div className="flex flex-wrap gap-2">
            {phanLoaiList.map((pl) => (
              <button
                key={pl.id}
                type="button"
                onClick={() => onChonPhanLoai(pl.id)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm transition',
                  pl.id === phanLoaiId
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                )}
              >
                {pl.tenPhanLoai}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Lọc theo tiêu chí — lấy động từ filter-schema của phân loại */}
      {tieuChiList.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Lọc theo tiêu chí</h3>
          <div className="space-y-2">
            {tieuChiList.map(([key, value]) => {
              const tc = value as TieuChi;
              return (
                <select
                  key={key}
                  value={thongSo[key] ?? ''}
                  onChange={(e) => onChonTieuChi(key, e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700 focus:border-primary focus:outline-none"
                >
                  <option value="">{tc.label ?? key}: Tất cả</option>
                  {(tc.values ?? []).map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Khoảng giá */}
      <div className="mb-5">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Khoảng giá</h3>
        <div className="flex items-center gap-2">
          <input
            value={tuGia}
            onChange={(e) => setTuGia(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            placeholder="Từ"
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
          />
          <span className="text-gray-400">–</span>
          <input
            value={denGia}
            onChange={(e) => setDenGia(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            placeholder="Đến"
            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={apDungGia}
          className="mt-2 w-full rounded-lg bg-primary py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Áp dụng
        </button>
      </div>

      {/* Đang lọc theo — gồm giá + các tiêu chí đã chọn */}
      {coDangLoc && (
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Đang lọc theo</h3>
            <button
              type="button"
              onClick={() => {
                setTuGia('');
                setDenGia('');
                onXoaTatCa();
              }}
              className="text-xs text-primary hover:underline"
            >
              Xóa tất cả
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(minPrice != null || maxPrice != null) && (
              <span className="inline-flex items-center gap-1 rounded bg-primary-50 px-2 py-1 text-xs text-primary">
                Giá: {minPrice != null ? formatPrice(minPrice) : '0'} –{' '}
                {maxPrice != null ? formatPrice(maxPrice) : '∞'}
                <button
                  type="button"
                  onClick={() => {
                    setTuGia('');
                    setDenGia('');
                    onApplyGia(undefined, undefined);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {tieuChiDangChon.map(([key, val]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 rounded bg-primary-50 px-2 py-1 text-xs text-primary"
              >
                {val}
                <button type="button" onClick={() => onChonTieuChi(key, '')}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 5. Sắp xếp theo */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Sắp xếp theo</h3>
        <SortSelect value={sortBy} onChange={onSort} />
      </div>
    </aside>
  );
}
