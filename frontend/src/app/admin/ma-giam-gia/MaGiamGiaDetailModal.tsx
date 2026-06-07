'use client';

import { useQuery } from '@tanstack/react-query';
import { formatPrice, formatNgay } from '@/lib/utils';
import { Modal } from '../_components/Modal';
import { StatusBadge } from '../_components/StatusBadge';
import { nhanTinhTrang } from '../_lib/discountStatus';
import { adminDiscountService } from '../_services/adminDiscountService';

export function MaGiamGiaDetailModal({ id, onClose }: { id: number; onClose: () => void }) {
  const { data: m } = useQuery({
    queryKey: ['admin-mgg-detail', id],
    queryFn: () => adminDiscountService.getChiTiet(id),
  });

  return (
    <Modal open title="Chi tiết mã giảm giá" size="lg" onClose={onClose}>
      {!m ? (
        <div className="py-10 text-center text-gray-400">Đang tải...</div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-primary">{m.maCode}</h3>
              <p className="text-sm text-gray-500">{m.tenMa}</p>
            </div>
            <StatusBadge {...nhanTinhTrang(m.tinhTrang)} />
          </div>

          {/* KPI */}
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Lượt đã dùng" value={`${m.soLuongDaDung}/${m.soLuongToiDa}`} />
            <Stat
              label="Tỷ lệ sử dụng"
              value={`${m.soLuongToiDa > 0 ? Math.round((m.soLuongDaDung / m.soLuongToiDa) * 100) : 0}%`}
            />
            <Stat
              label="Giá trị giảm"
              value={
                m.loaiGiam === 'PHAN_TRAM' ? `${Number(m.giaTriGiam)}%` : formatPrice(m.giaTriGiam)
              }
            />
          </div>

          {/* Thông tin */}
          <dl className="space-y-2 rounded-lg border border-gray-200 p-4 text-sm">
            <Row k="Điều kiện đơn tối thiểu" v={m.dieuKienToiThieu ? formatPrice(m.dieuKienToiThieu) : 'Không'} />
            {m.loaiGiam === 'PHAN_TRAM' && (
              <Row k="Giảm tối đa" v={m.giaTriGiamToiDa ? formatPrice(m.giaTriGiamToiDa) : 'Không giới hạn'} />
            )}
            <Row k="Hiệu lực" v={`${formatNgay(m.batDau)} – ${formatNgay(m.ketThuc)}`} />
            <Row
              k="Phạm vi"
              v={m.sanPhamIds && m.sanPhamIds.length > 0 ? `${m.sanPhamIds.length} sản phẩm cụ thể` : 'Toàn đơn hàng'}
            />
          </dl>

          {/* Lịch sử dùng */}
          <div>
            <h4 className="mb-2 font-semibold text-gray-900">Lịch sử sử dụng</h4>
            {m.lichSu && m.lichSu.length > 0 ? (
              <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-3 py-2">Đơn hàng</th>
                      <th className="px-3 py-2">Người dùng</th>
                      <th className="px-3 py-2">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {m.lichSu.map((l, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">#{l.donHangId}</td>
                        <td className="px-3 py-2">#{l.nguoiDungId}</td>
                        <td className="px-3 py-2 text-gray-500">{formatNgay(l.ngayTao)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Chưa có lượt sử dụng nào</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 text-center">
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
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
