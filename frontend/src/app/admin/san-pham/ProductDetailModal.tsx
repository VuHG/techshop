'use client';

import { useQuery } from '@tanstack/react-query';
import { Ticket } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Modal } from '../_components/Modal';
import { StatusBadge } from '../_components/StatusBadge';
import { nhanTrangThaiSp, nhanTrangThaiBienThe } from '../_lib/productStatus';
import { adminProductService, type AdminBienThe } from '../_services/adminProductService';

/**
 * - Mở từ sản phẩm (không bienTheId): chỉ hiển thị chi tiết SẢN PHẨM.
 * - Mở từ biến thể (có bienTheId): chi tiết sản phẩm bên trên + chi tiết biến thể đó bên dưới.
 */
export function ProductDetailModal({
  id,
  bienTheId,
  onClose,
}: {
  id: number;
  bienTheId?: number;
  onClose: () => void;
}) {
  const { data: sp } = useQuery({
    queryKey: ['admin-sp-detail', id],
    queryFn: () => adminProductService.getChiTiet(id),
  });

  const bt = sp && bienTheId != null ? sp.bienThes.find((b) => b.id === bienTheId) : undefined;

  return (
    <Modal open title={bienTheId != null ? 'Chi tiết biến thể' : 'Chi tiết sản phẩm'} size="lg" onClose={onClose}>
      {!sp ? (
        <div className="py-10 text-center text-gray-400">Đang tải...</div>
      ) : (
        <div className="space-y-5">
          {/* ── Chi tiết sản phẩm ── */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">{sp.tenSanPham}</h3>
              <StatusBadge {...nhanTrangThaiSp(sp.trangThai)} />
            </div>
            <p className="text-sm text-gray-500">
              {sp.tenDanhMuc}
              {sp.tenPhanLoai ? ` › ${sp.tenPhanLoai}` : ''}
              {sp.thuongHieu ? ` · ${sp.thuongHieu}` : ''}
            </p>
          </div>

          <div>
            <h4 className="mb-2 flex items-center gap-1.5 font-semibold text-gray-900">
              <Ticket className="h-4 w-4" /> Mã giảm giá áp dụng
            </h4>
            {sp.vouchers && sp.vouchers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {sp.vouchers.map((v) => (
                  <span key={v.maCode} className="rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs">
                    <b className="text-primary">{v.maCode}</b> · {v.tenMa}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Không có mã riêng cho sản phẩm này</p>
            )}
          </div>

          {sp.thongSoKyThuat && Object.keys(sp.thongSoKyThuat).length > 0 && (
            <div>
              <h4 className="mb-2 font-semibold text-gray-900">Thông số kỹ thuật chung</h4>
              <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                {Object.entries(sp.thongSoKyThuat).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2 border-b border-gray-50 py-1">
                    <dt className="text-gray-500">{k}</dt>
                    <dd className="text-right font-medium text-gray-800">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* ── Chi tiết biến thể (chỉ khi mở từ biến thể) ── */}
          {bienTheId != null && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="mb-2 font-semibold text-gray-900">Chi tiết biến thể</h4>
              {bt ? (
                <div className="rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-2.5">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {bt.tenBienThe || bt.maBienThe || Object.values(bt.thongSoBienThe).map(String).join(' · ') || 'Biến thể'}
                    </p>
                    {bt.laMacDinh && <StatusBadge label="Mặc định" tone="blue" />}
                  </div>
                  <VariantDetail bt={bt} />
                </div>
              ) : (
                <p className="text-sm text-gray-400">Không tìm thấy biến thể.</p>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function VariantDetail({ bt }: { bt: AdminBienThe }) {
  const st = nhanTrangThaiBienThe(bt.trangThai);
  return (
    <div className="space-y-3 px-4 py-3">
      <dl className="grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-2">
        <Row k="Giá niêm yết" v={formatPrice(bt.gia)} />
        <Row k="Giá bán" v={bt.giaKhuyenMai != null ? formatPrice(bt.giaKhuyenMai) : formatPrice(bt.gia)} />
        <Row k="Tồn kho" v={String(bt.soLuongTon)} />
        <div className="flex justify-between gap-2">
          <dt className="text-gray-500">Trạng thái</dt>
          <dd><StatusBadge label={st.label} tone={st.tone} /></dd>
        </div>
      </dl>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Nhãn</p>
        {bt.nhanTens && bt.nhanTens.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {bt.nhanTens.map((n) => (
              <span key={n} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">{n}</span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">Không có nhãn</p>
        )}
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase text-gray-400">Thông số</p>
        {Object.keys(bt.thongSoBienThe).length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(bt.thongSoBienThe).map(([k, v]) => (
              <span key={k} className="rounded-lg bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700">
                {k}: <b>{String(v)}</b>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">Không có thông số</p>
        )}
      </div>

      {bt.anhUrls && bt.anhUrls.length > 0 && (
        <p className="text-xs text-gray-400">{bt.anhUrls.length} ảnh</p>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-gray-500">{k}</dt>
      <dd className="font-medium text-gray-800">{v}</dd>
    </div>
  );
}
