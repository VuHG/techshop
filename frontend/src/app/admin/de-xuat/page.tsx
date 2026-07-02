'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Info, Sparkles, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPrice, formatNgay, cn } from '@/lib/utils';
import {
  adminDeXuatService,
  type DeXuatGia,
  type DeXuatVoucher,
} from '../_services/adminDeXuatService';
import { PageHeader } from '../_components/PageHeader';
import { DataTable, type Column } from '../_components/DataTable';
import { StatusBadge } from '../_components/StatusBadge';
import { Modal } from '../_components/Modal';

type Tab = 'gia' | 'voucher';

export default function AdminDeXuatPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('gia');
  const [lyDo, setLyDo] = useState<string | null>(null);

  const giaQuery = useQuery({ queryKey: ['dx-gia'], queryFn: adminDeXuatService.getGia });
  const voucherQuery = useQuery({ queryKey: ['dx-voucher'], queryFn: adminDeXuatService.getVoucher });

  const lamMoi = () => {
    qc.invalidateQueries({ queryKey: ['dx-gia'] });
    qc.invalidateQueries({ queryKey: ['dx-voucher'] });
  };

  const onXong = (msg: string) => () => {
    toast.success(msg);
    lamMoi();
  };

  const chapNhanGia = useMutation({
    mutationFn: adminDeXuatService.chapNhanGia,
    onSuccess: onXong('Đã áp dụng giá đề xuất'),
  });
  const tuChoiGia = useMutation({
    mutationFn: adminDeXuatService.tuChoiGia,
    onSuccess: onXong('Đã từ chối đề xuất'),
  });
  const chapNhanVoucher = useMutation({
    mutationFn: adminDeXuatService.chapNhanVoucher,
    onSuccess: onXong('Đã tạo voucher'),
  });
  const tuChoiVoucher = useMutation({
    mutationFn: adminDeXuatService.tuChoiVoucher,
    onSuccess: onXong('Đã từ chối đề xuất'),
  });

  const taoNgay = useMutation({
    mutationFn: adminDeXuatService.taoNgay,
    onSuccess: (r) => {
      toast.success(`Đã sinh ${r.deXuatGia} đề xuất giá, ${r.deXuatVoucher} đề xuất voucher`);
      lamMoi();
    },
  });

  const moTaGiamVoucher = (v: DeXuatVoucher) =>
    v.loaiGiam === 'PHAN_TRAM'
      ? `${Number(v.giaTriGiam)}%${v.giaTriGiamToiDa ? ` (tối đa ${formatPrice(v.giaTriGiamToiDa)})` : ''}`
      : formatPrice(v.giaTriGiam);

  const cotGia: Column<DeXuatGia>[] = [
    {
      header: 'Sản phẩm',
      cell: (d) => (
        <div>
          <p className="font-medium text-gray-900">{d.tenSanPham ?? `Biến thể #${d.bienTheId}`}</p>
          {d.mauSac && <p className="text-xs text-gray-500">{d.mauSac}</p>}
        </div>
      ),
    },
    { header: 'Giá gốc', cell: (d) => (d.gia != null ? formatPrice(d.gia) : '-') },
    { header: 'Đang bán', cell: (d) => (d.giaCu != null ? formatPrice(d.giaCu) : '-') },
    {
      header: 'Đề xuất',
      cell: (d) => (
        <div>
          <span className="font-semibold text-primary">{formatPrice(d.giaDeXuat)}</span>
          {d.gia ? (
            <span className="ml-1 text-xs text-sale">
              -{Math.round((1 - d.giaDeXuat / d.gia) * 100)}%
            </span>
          ) : null}
        </div>
      ),
    },
    {
      header: 'Hết hạn',
      cell: (d) => <span className="whitespace-nowrap text-xs text-gray-500">{formatNgay(d.ngayHetHan)}</span>,
    },
    {
      header: '',
      className: 'text-right',
      cell: (d) => (
        <ActionButtons
          onLyDo={() => setLyDo(d.lyDo)}
          onChapNhan={() => chapNhanGia.mutate(d.id)}
          onTuChoi={() => tuChoiGia.mutate(d.id)}
          disabled={chapNhanGia.isPending || tuChoiGia.isPending}
        />
      ),
    },
  ];

  const cotVoucher: Column<DeXuatVoucher>[] = [
    {
      header: 'Phạm vi',
      cell: (v) =>
        v.phamVi === 'SAN_PHAM' ? (
          <StatusBadge label="Sản phẩm" tone="blue" />
        ) : (
          <StatusBadge label="Tổng hóa đơn" tone="amber" />
        ),
    },
    {
      header: 'Voucher',
      cell: (v) => (
        <div>
          <p className="font-medium text-gray-900">{v.tenMa}</p>
          {v.tenSanPham && <p className="text-xs text-gray-500">{v.tenSanPham}</p>}
        </div>
      ),
    },
    { header: 'Giảm', cell: (v) => <span className="font-medium">{moTaGiamVoucher(v)}</span> },
    {
      header: 'Điều kiện',
      cell: (v) => (v.dieuKienToiThieu ? `Từ ${formatPrice(v.dieuKienToiThieu)}` : 'Không'),
    },
    { header: 'Hiệu lực', cell: (v) => `${v.soNgayHieuLuc} ngày` },
    {
      header: 'Hết hạn',
      cell: (v) => <span className="whitespace-nowrap text-xs text-gray-500">{formatNgay(v.ngayHetHan)}</span>,
    },
    {
      header: '',
      className: 'text-right',
      cell: (v) => (
        <ActionButtons
          onLyDo={() => setLyDo(v.lyDo)}
          onChapNhan={() => chapNhanVoucher.mutate(v.id)}
          onTuChoi={() => tuChoiVoucher.mutate(v.id)}
          disabled={chapNhanVoucher.isPending || tuChoiVoucher.isPending}
        />
      ),
    },
  ];

  const soGia = giaQuery.data?.length ?? 0;
  const soVoucher = voucherQuery.data?.length ?? 0;

  return (
    <div>
      <PageHeader
        title="Đề xuất giá & voucher"
        subtitle="Hệ thống tự phân tích và đề xuất; bạn Chấp nhận hoặc Từ chối. Đề xuất tự hết hạn sau 3 ngày."
        action={
          <button
            onClick={() => taoNgay.mutate()}
            disabled={taoNgay.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {taoNgay.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Tạo đề xuất ngay
          </button>
        }
      />

      <div className="mb-4 flex gap-2">
        <TabBtn active={tab === 'gia'} onClick={() => setTab('gia')}>
          Đề xuất giá ({soGia})
        </TabBtn>
        <TabBtn active={tab === 'voucher'} onClick={() => setTab('voucher')}>
          Đề xuất voucher ({soVoucher})
        </TabBtn>
      </div>

      {tab === 'gia' ? (
        <DataTable
          columns={cotGia}
          rows={giaQuery.data ?? []}
          rowKey={(d) => d.id}
          dangTai={giaQuery.isLoading}
          thongBaoRong="Chưa có đề xuất giá nào. Bấm 'Tạo đề xuất ngay' để phân tích."
        />
      ) : (
        <DataTable
          columns={cotVoucher}
          rows={voucherQuery.data ?? []}
          rowKey={(v) => v.id}
          dangTai={voucherQuery.isLoading}
          thongBaoRong="Chưa có đề xuất voucher nào. Bấm 'Tạo đề xuất ngay' để phân tích."
        />
      )}

      <Modal open={lyDo != null} title="Lý do đề xuất" onClose={() => setLyDo(null)}>
        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{lyDo}</p>
      </Modal>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg px-4 py-2 text-sm font-medium transition',
        active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
      )}
    >
      {children}
    </button>
  );
}

function ActionButtons({
  onLyDo,
  onChapNhan,
  onTuChoi,
  disabled,
}: {
  onLyDo: () => void;
  onChapNhan: () => void;
  onTuChoi: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        title="Xem lý do"
        onClick={onLyDo}
        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
      >
        <Info className="h-4 w-4" />
      </button>
      <button
        title="Chấp nhận"
        onClick={onChapNhan}
        disabled={disabled}
        className="rounded-lg p-2 text-green-600 transition hover:bg-green-50 disabled:opacity-50"
      >
        <Check className="h-4 w-4" />
      </button>
      <button
        title="Từ chối"
        onClick={onTuChoi}
        disabled={disabled}
        className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
