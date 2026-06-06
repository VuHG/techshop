'use client';

import { useQuery } from '@tanstack/react-query';
import { formatNgay, formatPrice } from '@/lib/utils';
import { Modal } from '../_components/Modal';
import { StatusBadge } from '../_components/StatusBadge';
import { nhanTrangThai } from '../_lib/orderStatus';
import { adminUserService } from '../_services/adminUserService';

export function NguoiDungDetailModal({ id, onClose }: { id: number; onClose: () => void }) {
  const { data: u } = useQuery({
    queryKey: ['admin-user-detail', id],
    queryFn: () => adminUserService.getChiTiet(id),
  });
  const { data: don } = useQuery({
    queryKey: ['admin-user-don', id],
    queryFn: () => adminUserService.getDonHang(id, 0, 5),
  });

  return (
    <Modal open title="Chi tiết người dùng" size="lg" onClose={onClose}>
      {!u ? (
        <div className="py-10 text-center text-gray-400">Đang tải...</div>
      ) : (
        <div className="space-y-5">
          {/* Hồ sơ */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{u.hoTen}</h3>
              <p className="text-sm text-gray-500">{u.soDienThoai}{u.email ? ` · ${u.email}` : ''}</p>
              <p className="text-xs text-gray-400">Tham gia {formatNgay(u.ngayTao)}</p>
            </div>
            <StatusBadge
              label={u.vaiTro === 'ADMIN' ? 'Quản trị' : 'Khách hàng'}
              tone={u.vaiTro === 'ADMIN' ? 'violet' : 'gray'}
            />
          </div>

          {/* Thống kê */}
          {u.thongKe && (
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Đơn hàng" value={u.thongKe.soDon} />
              <Stat label="Đánh giá" value={u.thongKe.soDanhGia} />
              <Stat label="Địa chỉ" value={u.thongKe.soDiaChi} />
            </div>
          )}

          {/* Địa chỉ */}
          <div>
            <h4 className="mb-2 font-semibold text-gray-900">Sổ địa chỉ</h4>
            {u.diaChis && u.diaChis.length > 0 ? (
              <ul className="space-y-2">
                {u.diaChis.map((d) => (
                  <li key={d.id} className="rounded-lg border border-gray-200 p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{d.hoTenNguoiNhan}</span>
                      <span className="text-gray-500">{d.soDienThoai}</span>
                      {d.laMacDinh && <StatusBadge label="Mặc định" tone="green" />}
                    </div>
                    <p className="text-gray-600">{d.diaChiDayDu}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">Chưa có địa chỉ</p>
            )}
          </div>

          {/* Đơn hàng gần đây */}
          <div>
            <h4 className="mb-2 font-semibold text-gray-900">Đơn hàng gần đây</h4>
            {don && don.items.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {don.items.map((o) => (
                  <li key={o.id} className="flex items-center justify-between py-2 text-sm">
                    <div>
                      <p className="font-medium text-primary">{o.maDonHang}</p>
                      <p className="text-xs text-gray-500">{formatNgay(o.ngayTao)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{formatPrice(o.tongThanhToan)}</span>
                      <StatusBadge {...nhanTrangThai(o.trangThai)} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">Chưa có đơn hàng</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 text-center">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
