'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice, formatNgay } from '@/lib/utils';
import { ProductImage } from '@/components/ui/ProductImage';
import { adminOrderService } from '../../_services/adminOrderService';
import { nhanTrangThai } from '../../_lib/orderStatus';
import { StatusBadge } from '../../_components/StatusBadge';
import { ConfirmDialog } from '../../_components/ConfirmDialog';
import { OrderStatusStepper } from '../../_components/OrderStatusStepper';

export default function AdminDonHangChiTietPage() {
  const { id } = useParams<{ id: string }>();
  const donHangId = Number(id);
  const router = useRouter();
  const qc = useQueryClient();
  const [moHuy, setMoHuy] = useState(false);
  const [lyDo, setLyDo] = useState('');

  const { data: don, isLoading } = useQuery({
    queryKey: ['admin-don-hang', donHangId],
    queryFn: () => adminOrderService.getChiTiet(donHangId),
    enabled: !Number.isNaN(donHangId),
  });

  const lamMoi = () => {
    qc.invalidateQueries({ queryKey: ['admin-don-hang'] });
    qc.invalidateQueries({ queryKey: ['admin-don-hang-counts'] });
  };

  const duyet = useMutation({
    mutationFn: () => adminOrderService.duyet(donHangId),
    onSuccess: () => {
      toast.success('Đã duyệt đơn');
      lamMoi();
    },
  });
  const giao = useMutation({
    mutationFn: () => adminOrderService.giao(donHangId),
    onSuccess: () => {
      toast.success('Đã bàn giao vận chuyển');
      lamMoi();
    },
  });
  const hoanTat = useMutation({
    mutationFn: () => adminOrderService.hoanTat(donHangId),
    onSuccess: () => {
      toast.success('Đã đánh dấu giao thành công');
      lamMoi();
    },
  });
  const huy = useMutation({
    mutationFn: () => adminOrderService.huy(donHangId, lyDo),
    onSuccess: () => {
      toast.success('Đã hủy đơn');
      setMoHuy(false);
      setLyDo('');
      lamMoi();
    },
  });
  const hoanKho = useMutation({
    mutationFn: () => adminOrderService.xacNhanHoanKho(donHangId),
    onSuccess: () => {
      toast.success('Đã xác nhận hàng trở lại kho');
      lamMoi();
    },
  });

  if (isLoading || !don) {
    return <div className="py-20 text-center text-gray-400">Đang tải...</div>;
  }

  const tt = don.trangThai;
  const { label, tone } = nhanTrangThai(tt);
  const coTheHuy = ['CHO_XU_LY', 'DA_DUYET', 'DANG_GIAO'].includes(tt);

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={() => router.push('/admin/don-hang')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 print:hidden"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
      </button>

      {/* Tiêu đề chỉ in khi xuất hóa đơn */}
      <div className="mb-4 hidden print:block">
        <p className="text-xl font-bold text-primary">TechShop</p>
        <p className="text-sm text-gray-500">Hóa đơn bán hàng</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{don.maDonHang}</h1>
          <StatusBadge label={label} tone={tone} />
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <Printer className="h-4 w-4" /> In hóa đơn
          </button>
          {tt === 'CHO_XU_LY' && (
            <button
              onClick={() => duyet.mutate()}
              disabled={duyet.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              Duyệt đơn
            </button>
          )}
          {tt === 'DA_DUYET' && (
            <button
              onClick={() => giao.mutate()}
              disabled={giao.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              Bàn giao vận chuyển
            </button>
          )}
          {tt === 'DANG_GIAO' && (
            <button
              onClick={() => hoanTat.mutate()}
              disabled={hoanTat.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              Giao thành công
            </button>
          )}
          {coTheHuy && (
            <button
              onClick={() => setMoHuy(true)}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Hủy đơn
            </button>
          )}
          {tt === 'DA_HUY' && !don.daHoanKho && (
            <button
              onClick={() => hoanKho.mutate()}
              disabled={hoanKho.isPending}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              Xác nhận đã nhập lại kho
            </button>
          )}
          {tt === 'DA_HUY' && don.daHoanKho && (
            <span className="inline-flex items-center rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
              Đã nhập lại kho
            </span>
          )}
        </div>
      </div>

      {/* Tiến trình trạng thái */}
      <div className="mb-5">
        <OrderStatusStepper trangThai={tt} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Thông tin nhận hàng */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-gray-900">Thông tin nhận hàng</h2>
          <dl className="space-y-2 text-sm">
            <Row k="Người nhận" v={don.hoTenNguoiNhan} />
            <Row k="Số điện thoại" v={don.soDienThoaiNhan} />
            <Row k="Địa chỉ" v={don.diaChiGiaoHang} />
            <Row k="Thanh toán" v={don.phuongThucThanhToan} />
            {don.ghiChu && <Row k="Ghi chú" v={don.ghiChu} />}
          </dl>
        </section>

        {/* Tài chính */}
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-gray-900">Thanh toán</h2>
          <dl className="space-y-2 text-sm">
            <Row k="Tạm tính" v={formatPrice(don.tongTienHang)} />
            <Row k="Giảm giá" v={`- ${formatPrice(don.tienGiamGia)}`} />
            <Row k="Phí vận chuyển" v={formatPrice(don.phiVanChuyen)} />
            <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-gray-900">
              <span>Tổng cộng</span>
              <span className="text-primary">{formatPrice(don.tongThanhToan)}</span>
            </div>
          </dl>
        </section>
      </div>

      {/* Sản phẩm */}
      <section className="mt-5 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-semibold text-gray-900">Sản phẩm ({don.items.length})</h2>
        <div className="divide-y divide-gray-100">
          {don.items.map((it, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <ProductImage
                src={it.duongDanAnhChinh}
                alt={it.tenSanPham}
                className="h-14 w-14 shrink-0 rounded-lg border border-gray-100"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{it.tenSanPham}</p>
                {it.thuongHieu && <p className="truncate text-xs text-gray-500">Hãng: {it.thuongHieu}</p>}
                <p className="truncate text-xs text-gray-500">
                  {Object.values(it.thongSoBienThe).join(' · ')}
                </p>
                {it.tienGiamSanPham != null && it.tienGiamSanPham > 0 && (
                  <p className="mt-0.5 inline-flex rounded bg-sale/10 px-1.5 py-0.5 text-[11px] font-medium text-sale">
                    Giảm trực tiếp: -{formatPrice(it.tienGiamSanPham)}
                  </p>
                )}
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-900">{formatPrice(it.giaLucMua)}</p>
                <p className="text-xs text-gray-500">x{it.soLuong}</p>
              </div>
              <div className="w-28 text-right text-sm font-semibold text-gray-900">
                {formatPrice(it.thanhTien)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mt-5 rounded-xl border border-gray-200 bg-white p-5 print:hidden">
        <h2 className="mb-3 font-semibold text-gray-900">Lịch sử trạng thái</h2>
        <ol className="space-y-3">
          {don.lichSu.map((ls, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div>
                <p className="font-medium text-gray-900">{nhanTrangThai(ls.trangThai).label}</p>
                {ls.ghiChu && <p className="text-gray-500">{ls.ghiChu}</p>}
                <p className="text-xs text-gray-400">{formatNgay(ls.ngayTao)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <ConfirmDialog
        open={moHuy}
        title="Hủy đơn hàng"
        message={
          <div>
            <p className="mb-2">
              Đơn sẽ chuyển sang <b>Đã hủy</b>, lượt dùng mã được hoàn ngay. Riêng <b>tồn kho</b> chỉ
              hoàn sau khi bấm <b>“Xác nhận đã nhập lại kho”</b>.
            </p>
            <textarea
              value={lyDo}
              onChange={(e) => setLyDo(e.target.value)}
              rows={2}
              placeholder="Lý do hủy (tùy chọn)..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        }
        confirmLabel="Xác nhận hủy"
        dangXuLy={huy.isPending}
        onConfirm={() => huy.mutate()}
        onClose={() => setMoHuy(false)}
      />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-gray-500">{k}</dt>
      <dd className="text-right font-medium text-gray-900">{v}</dd>
    </div>
  );
}
