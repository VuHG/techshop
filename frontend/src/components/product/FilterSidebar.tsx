'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import type { FilterSchema, PhanLoai } from '@/types';
import { SortSelect, type SortValue } from './SortSelect';

interface FilterSidebarProps {
  phanLoaiList: PhanLoai[];
  phanLoaiId?: number;
  onChonPhanLoai: (id: number) => void;
  minPrice?: number;
  maxPrice?: number;
  onApplyGia: (min?: number, max?: number) => void;
  sortBy: SortValue;
  onSort: (s: SortValue) => void;
  schema?: FilterSchema;
  onXoaTatCa: () => void;
}

// Một tiêu chí lọc trong filter-schema JSONB.
interface TieuChi {
  label?: string;
  values?: string[];
}

export function FilterSidebar({
  phanLoaiList,
  phanLoaiId,
  onChonPhanLoai,
  minPrice,
  maxPrice,
  onApplyGia,
  sortBy,
  onSort,
  schema,
  onXoaTatCa,
}: FilterSidebarProps) {
  const [tuGia, setTuGia] = useState('');
  const [denGia, setDenGia] = useState('');

  const apDungGia = () => {
    const mn = tuGia ? Number(tuGia) : undefined;
    const mx = denGia ? Number(denGia) : undefined;
    onApplyGia(mn, mx);
  };

  const tieuChiList = schema ? Object.entries(schema) : [];
  const coDangLoc = minPrice != null || maxPrice != null;

  return (
    <aside className="hidden w-64 shrink-0 rounded-xl border border-gray-100 bg-white p-4 lg:block">
      {/* Phân loại */}
      {phanLoaiList.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Chọn phân loại</h3>
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

      {/* Khoảng giá */}
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

      {/* Lọc nâng cao theo thuộc tính (JSONB) — backend chưa hỗ trợ → hiển thị, disabled */}
      {tieuChiList.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Lọc theo tiêu chí</h3>
          <div className="grid grid-cols-2 gap-2">
            {tieuChiList.map(([key, value]) => {
              const tc = value as TieuChi;
              return (
                <select
                  key={key}
                  disabled
                  className="cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-400"
                >
                  <option>{tc.label ?? key}</option>
                </select>
              );
            })}
          </div>
          <p className="mt-1 text-[11px] italic text-gray-400">Lọc nâng cao đang phát triển</p>
        </div>
      )}

      {/* Đang lọc theo */}
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
        </div>
      )}

      {/* Sắp xếp */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-700">Sắp xếp theo</h3>
        <SortSelect value={sortBy} onChange={onSort} />
      </div>
    </aside>
  );
}
