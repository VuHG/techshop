'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Modal } from '../_components/Modal';
import {
  adminProductService,
  type BienThePayload,
  type BienTheDong,
} from '../_services/adminProductService';

const inp =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

/** Form thêm/sửa MỘT biến thể. Thông số chọn từ filter schema của phân loại. */
export function ThemBienTheModal({
  sanPhamId,
  phanLoaiId,
  tenSanPham,
  editing,
  onClose,
  onSaved,
}: {
  sanPhamId: number;
  phanLoaiId: number;
  tenSanPham: string;
  editing?: BienTheDong | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data: schema } = useQuery({
    queryKey: ['admin-filter-schema', phanLoaiId],
    queryFn: () => adminProductService.getFilterSchema(phanLoaiId),
  });

  const [mauSac, setMauSac] = useState(editing?.mauSac ?? '');
  const [gia, setGia] = useState(editing ? String(editing.gia) : '');
  const [giaBan, setGiaBan] = useState(
    editing ? String(editing.giaKhuyenMai ?? editing.gia) : '',
  );
  const [soLuongTon, setSoLuongTon] = useState(editing ? String(editing.soLuongTon) : '0');
  const [laMacDinh, setLaMacDinh] = useState(editing?.laMacDinh ?? false);
  const [thongSo, setThongSo] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (editing?.thongSoBienThe) {
      for (const [k, v] of Object.entries(editing.thongSoBienThe)) init[k] = String(v ?? '');
    }
    return init;
  });
  const [dangLuu, setDangLuu] = useState(false);

  const chonThongSo = (key: string, value: string) =>
    setThongSo((prev) => {
      const next = { ...prev };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });

  // Màu sắc đã có ô riêng → loại khỏi dropdown thông số để tránh trùng.
  const MAU_KEYS = ['color', 'mau_sac', 'mauSac', 'Màu sắc'];
  const schemaKeys = schema ? Object.keys(schema).filter((k) => !MAU_KEYS.includes(k)) : [];

  const luu = async () => {
    // Mọi trường bắt buộc phải có giá trị (tránh thiếu dữ liệu).
    if (!gia || Number(gia) <= 0) return toast.error('Nhập giá niêm yết hợp lệ');
    if (!giaBan || Number(giaBan) <= 0) return toast.error('Nhập giá khuyến mãi hợp lệ');
    if (Number(giaBan) > Number(gia)) return toast.error('Giá khuyến mãi không được lớn hơn giá niêm yết');
    if (soLuongTon === '' || Number(soLuongTon) < 0) return toast.error('Nhập số lượng tồn hợp lệ');
    if (!mauSac.trim()) return toast.error('Nhập màu sắc');

    // Thông số bắt buộc: khi THÊM phải chọn đủ mọi thông số của phân loại; khi SỬA chỉ bắt buộc
    // các thông số biến thể vốn có (thuộc tính mới thêm sau mà biến thể cũ chưa có → không bắt buộc).
    const requiredKeys = editing
      ? schemaKeys.filter((k) =>
          editing.thongSoBienThe && Object.prototype.hasOwnProperty.call(editing.thongSoBienThe, k),
        )
      : schemaKeys;
    const thieu = requiredKeys.filter((k) => !thongSo[k]);
    if (thieu.length > 0) {
      const tens = thieu.map((k) => schema?.[k]?.label ?? k).join(', ');
      return toast.error(`Vui lòng chọn đầy đủ thông số: ${tens}`);
    }

    const payload: BienThePayload = {
      mauSac: mauSac.trim(),
      gia: Number(gia),
      giaBan: Number(giaBan),
      soLuongTon: Number(soLuongTon),
      laMacDinh,   // chỉ có tác dụng khi sửa; khi thêm BE tự quyết định
      thongSoBienThe: thongSo,
    };

    setDangLuu(true);
    try {
      if (editing) await adminProductService.suaBienThe(editing.id, payload);
      else await adminProductService.themBienThe(sanPhamId, payload);
      toast.success(editing ? 'Đã cập nhật biến thể' : 'Đã thêm biến thể');
      onSaved();
    } catch {
      // interceptor đã toast lỗi
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <Modal open title={editing ? 'Sửa biến thể' : 'Thêm biến thể'} size="md" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Sản phẩm: <b className="text-gray-900">{tenSanPham}</b>
        </p>

        <Field label="Màu sắc *">
          <input className={inp} value={mauSac} onChange={(e) => setMauSac(e.target.value)} placeholder="VD: Đen" />
        </Field>
        <p className="-mt-1 text-xs text-gray-400">
          Tên biến thể tự sinh từ thông số + màu, VD <i>Intel Core i5 / 8GB / 512GB / Bạc</i>.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Giá niêm yết *">
            <input type="number" className={inp} value={gia} onChange={(e) => setGia(e.target.value)} />
          </Field>
          <Field label="Giá khuyến mãi *">
            <input type="number" className={inp} value={giaBan} onChange={(e) => setGiaBan(e.target.value)} />
          </Field>
          <Field label={editing ? 'Số lượng tồn' : 'Số lượng tồn *'}>
            <input
              type="number"
              className={inp + (editing ? ' cursor-not-allowed bg-gray-100 text-gray-500' : '')}
              value={soLuongTon}
              onChange={(e) => setSoLuongTon(e.target.value)}
              disabled={!!editing}
            />
            {editing && (
              <p className="mt-1 text-xs text-gray-400">Sửa tồn kho ở trang <b>Kho hàng</b>.</p>
            )}
          </Field>
          {editing && (
            <Field label="Biến thể mặc định">
              <label className="flex h-[42px] items-center gap-2 rounded-lg border border-gray-300 px-3 text-sm">
                <input type="checkbox" checked={laMacDinh} onChange={(e) => setLaMacDinh(e.target.checked)} />
                <span className="text-gray-700">{laMacDinh ? 'Có' : 'Không'}</span>
              </label>
            </Field>
          )}
        </div>
        {!editing && (
          <p className="-mt-1 text-xs text-gray-400">
            Biến thể đầu tiên của sản phẩm tự động là mặc định. Đổi mặc định ở chức năng <b>Sửa biến thể</b>.
          </p>
        )}

        {/* Thông số biến thể — dropdown từ filter schema */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Thông số biến thể</label>
          {schemaKeys.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 px-3 py-3 text-xs text-gray-400">
              Phân loại này chưa có thông số lọc. Hãy thêm ở mục <b>Thuộc tính</b> trước.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {schemaKeys.map((key) => {
                const item = schema![key];
                return (
                  <div key={key}>
                    <label className="mb-1 block text-xs text-gray-500">{item.label}</label>
                    <select className={inp} value={thongSo[key] ?? ''} onChange={(e) => chonThongSo(key, e.target.value)}>
                      <option value="">— Không chọn —</option>
                      {item.values.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
          <button onClick={onClose} disabled={dangLuu} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60">
            Quay lại
          </button>
          <button onClick={luu} disabled={dangLuu} className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
            {dangLuu ? 'Đang lưu...' : 'Lưu biến thể'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}
