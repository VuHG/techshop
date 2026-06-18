'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Search, Info, Boxes } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { ProductImage } from '@/components/ui/ProductImage';
import { adminProductService, type BienTheDong } from '../_services/adminProductService';
import { nhanTrangThaiSp, nhanTrangThaiBienThe } from '../_lib/productStatus';
import { PageHeader } from '../_components/PageHeader';
import { StatusBadge } from '../_components/StatusBadge';
import { AdminPagination } from '../_components/AdminPagination';
import { Modal } from '../_components/Modal';
import { ProductDetailModal } from '../san-pham/ProductDetailModal';

// Lưới: Sản phẩm/Biến thể | Danh mục | Tồn | Trạng thái | Thao tác.
const GRID = 'grid grid-cols-[minmax(0,2.6fr)_1.4fr_0.7fr_1fr_140px] items-center gap-3';

export default function AdminKhoPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [danhMucId, setDanhMucId] = useState<number | ''>('');
  const [phanLoaiId, setPhanLoaiId] = useState<number | ''>('');
  const [page, setPage] = useState(0);

  const [detailId, setDetailId] = useState<number | null>(null);
  const [suaTon, setSuaTon] = useState<{ id: number; ten: string; ton: number } | null>(null);

  const { data: options } = useQuery({
    queryKey: ['admin-sp-options'],
    queryFn: () => adminProductService.getFormOptions(),
  });
  const { data, isLoading } = useQuery({
    queryKey: ['admin-kho', search, danhMucId, phanLoaiId, page],
    queryFn: () =>
      adminProductService.getDanhSach(
        undefined,
        search,
        page,
        20,
        danhMucId === '' ? undefined : danhMucId,
        phanLoaiId === '' ? undefined : phanLoaiId,
      ),
    placeholderData: keepPreviousData,
  });

  const danhMucs = Array.from(
    new Map((options?.phanLoais ?? []).map((p) => [p.danhMucId, p.tenDanhMuc])).entries(),
  ).map(([id, ten]) => ({ id, ten }));
  const phanLoaisLoc = (options?.phanLoais ?? []).filter(
    (p) => danhMucId === '' || p.danhMucId === danhMucId,
  );

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(0);
  };

  return (
    <div>
      <PageHeader title="Kho hàng" subtitle="Theo dõi và cập nhật tồn kho từng biến thể" />

      <form onSubmit={onSearch} className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tên sản phẩm..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={danhMucId}
          onChange={(e) => {
            setDanhMucId(e.target.value ? Number(e.target.value) : '');
            setPhanLoaiId('');
            setPage(0);
          }}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Tất cả danh mục</option>
          {danhMucs.map((d) => (
            <option key={d.id} value={d.id}>{d.ten}</option>
          ))}
        </select>
        <select
          value={phanLoaiId}
          onChange={(e) => {
            setPhanLoaiId(e.target.value ? Number(e.target.value) : '');
            setPage(0);
          }}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Tất cả phân loại</option>
          {phanLoaisLoc.map((p) => (
            <option key={p.id} value={p.id}>{p.tenPhanLoai}</option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
          Tìm
        </button>
      </form>

      <div className="overflow-x-auto">
        <div className="min-w-[820px]">
          <div className={cn(GRID, 'px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500')}>
            <span>Sản phẩm / Biến thể</span>
            <span>Danh mục</span>
            <span className="text-center">Tồn</span>
            <span>Trạng thái</span>
            <span className="text-right">Thao tác</span>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-gray-200 bg-white py-12 text-center text-gray-400">Đang tải...</div>
          ) : (data?.items.length ?? 0) === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white py-12 text-center text-gray-400">Chưa có sản phẩm nào</div>
          ) : (
            <div className="space-y-3">
              {data!.items.map((sp) => {
                const spTt = nhanTrangThaiSp(sp.trangThai);
                return (
                  <div key={sp.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className={cn(GRID, 'bg-gray-50 px-4 py-3')}>
                      <div className="flex min-w-0 items-center gap-3">
                        <ProductImage src={sp.anhChinh} alt={sp.tenSanPham} className="h-12 w-12 shrink-0 rounded-lg border border-gray-100" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">{sp.tenSanPham}</p>
                          <p className="truncate text-xs text-gray-500">
                            {sp.thuongHieu ? `${sp.thuongHieu} · ` : ''}{sp.soBienThe} biến thể
                          </p>
                        </div>
                      </div>
                      <span className="truncate text-sm text-gray-600">
                        {sp.tenDanhMuc}{sp.tenPhanLoai ? ` › ${sp.tenPhanLoai}` : ''}
                      </span>
                      <span className="text-center text-sm font-semibold text-gray-900">{sp.tongTon}</span>
                      <span><StatusBadge label={spTt.label} tone={spTt.tone} /></span>
                      <div className="flex items-center justify-end gap-1">
                        <IconBtn title="Xem chi tiết" onClick={() => setDetailId(sp.id)}><Info className="h-4 w-4" /></IconBtn>
                      </div>
                    </div>

                    {sp.bienThes.length === 0 ? (
                      <div className="border-t border-gray-100 px-4 py-3 pl-14 text-xs text-gray-400">
                        Chưa có biến thể.
                      </div>
                    ) : (
                      sp.bienThes.map((bt) => (
                        <KhoRow
                          key={bt.id}
                          bt={bt}
                          onView={() => setDetailId(sp.id)}
                          onSuaTon={() => setSuaTon({ id: bt.id, ten: tenBienThe(bt), ton: bt.soLuongTon })}
                        />
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {data && (
        <AdminPagination currentPage={data.currentPage} totalPages={data.totalPages} onChange={setPage} />
      )}

      {detailId != null && (
        <ProductDetailModal id={detailId} onClose={() => setDetailId(null)} />
      )}

      {suaTon && (
        <CapNhatTonModal
          bienTheId={suaTon.id}
          tenBienThe={suaTon.ten}
          tonHienTai={suaTon.ton}
          onClose={() => setSuaTon(null)}
          onSaved={() => {
            setSuaTon(null);
            qc.invalidateQueries({ queryKey: ['admin-kho'] });
          }}
        />
      )}
    </div>
  );
}

function tenBienThe(bt: BienTheDong): string {
  return (
    bt.tenBienThe
    || [...Object.values(bt.thongSoBienThe).map(String), bt.mauSac].filter(Boolean).join(' · ')
    || bt.maBienThe
    || 'Biến thể'
  );
}

function KhoRow({
  bt,
  onView,
  onSuaTon,
}: {
  bt: BienTheDong;
  onView: () => void;
  onSuaTon: () => void;
}) {
  const tt = nhanTrangThaiBienThe(bt.trangThai);
  return (
    <div className={cn(GRID, 'border-t border-gray-100 px-4 py-2.5')}>
      <div className="flex min-w-0 items-center gap-2 pl-6">
        <span className="text-gray-300">└</span>
        <ProductImage src={bt.anhChinh} alt={tenBienThe(bt)} className="h-9 w-9 shrink-0 rounded-md border border-gray-100" />
        <div className="min-w-0">
          <p className="truncate text-sm text-gray-800">{tenBienThe(bt)}</p>
          {bt.maBienThe && <p className="truncate text-xs text-gray-400">{bt.maBienThe}</p>}
        </div>
      </div>
      <span className="text-xs text-gray-300">—</span>
      <span className="text-center text-sm font-semibold text-gray-900">{bt.soLuongTon}</span>
      <span><StatusBadge label={tt.label} tone={tt.tone} /></span>
      <div className="flex items-center justify-end gap-1">
        <IconBtn title="Xem chi tiết" onClick={onView}><Info className="h-4 w-4" /></IconBtn>
        <button
          onClick={onSuaTon}
          className="flex items-center gap-1.5 rounded-lg border border-primary px-2.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary-50"
        >
          <Boxes className="h-3.5 w-3.5" /> Cập nhật tồn
        </button>
      </div>
    </div>
  );
}

function CapNhatTonModal({
  bienTheId,
  tenBienThe,
  tonHienTai,
  onClose,
  onSaved,
}: {
  bienTheId: number;
  tenBienThe: string;
  tonHienTai: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [ton, setTon] = useState(String(tonHienTai));
  const luu = useMutation({
    mutationFn: () => adminProductService.capNhatTonKho(bienTheId, Number(ton)),
    onSuccess: () => {
      toast.success('Đã cập nhật tồn kho');
      onSaved();
    },
  });

  return (
    <Modal open title="Cập nhật tồn kho" size="md" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Biến thể: <b className="text-gray-900">{tenBienThe}</b>
        </p>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Số lượng tồn mới</label>
          <input
            type="number"
            min={0}
            value={ton}
            onChange={(e) => setTon(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-1 text-xs text-gray-400">Tồn = 0 → biến thể tự chuyển <b>Hết hàng</b>; &gt; 0 → <b>Còn hàng</b>.</p>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
          <button
            onClick={onClose}
            disabled={luu.isPending}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
          >
            Quay lại
          </button>
          <button
            onClick={() => {
              if (ton === '' || Number(ton) < 0) return toast.error('Nhập số lượng tồn hợp lệ');
              luu.mutate();
            }}
            disabled={luu.isPending}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {luu.isPending ? 'Đang lưu...' : 'Lưu tồn kho'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function IconBtn({
  children,
  title,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-100"
    >
      {children}
    </button>
  );
}
