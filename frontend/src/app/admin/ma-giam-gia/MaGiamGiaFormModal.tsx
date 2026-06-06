'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Modal } from '../_components/Modal';
import { isoToLocalInput, localInputToIso } from '../_lib/discountStatus';
import {
  adminDiscountService,
  type MaGiamGia,
  type MaGiamGiaPayload,
} from '../_services/adminDiscountService';
import { adminProductService } from '../_services/adminProductService';

const inp =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

export function MaGiamGiaFormModal({
  editing,
  onClose,
  onSaved,
}: {
  editing: MaGiamGia | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [maCode, setMaCode] = useState(editing?.maCode ?? '');
  const [tenMa, setTenMa] = useState(editing?.tenMa ?? '');
  const [loaiGiam, setLoaiGiam] = useState(editing?.loaiGiam ?? 'PHAN_TRAM');
  const [giaTriGiam, setGiaTriGiam] = useState(editing ? String(editing.giaTriGiam) : '');
  const [giaTriGiamToiDa, setGiaTriGiamToiDa] = useState(
    editing?.giaTriGiamToiDa != null ? String(editing.giaTriGiamToiDa) : '',
  );
  const [dieuKienToiThieu, setDieuKienToiThieu] = useState(
    editing?.dieuKienToiThieu != null ? String(editing.dieuKienToiThieu) : '',
  );
  const [soLuongToiDa, setSoLuongToiDa] = useState(editing ? String(editing.soLuongToiDa) : '100');
  const [batDau, setBatDau] = useState(isoToLocalInput(editing?.batDau));
  const [ketThuc, setKetThuc] = useState(isoToLocalInput(editing?.ketThuc));
  const [trangThai, setTrangThai] = useState(editing?.trangThai ?? 'HOAT_DONG');
  const [apDung, setApDung] = useState<'DON_HANG' | 'SAN_PHAM'>(
    editing?.sanPhamIds && editing.sanPhamIds.length > 0 ? 'SAN_PHAM' : 'DON_HANG',
  );
  const [sanPhamIds, setSanPhamIds] = useState<number[]>(editing?.sanPhamIds ?? []);
  const [timSp, setTimSp] = useState('');
  const [dangLuu, setDangLuu] = useState(false);

  const { data: spList } = useQuery({
    queryKey: ['admin-discount-sp', timSp],
    queryFn: () => adminProductService.getDanhSach('', timSp, 0, 20),
    enabled: apDung === 'SAN_PHAM',
  });

  const toggleSp = (id: number) =>
    setSanPhamIds((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));

  const luu = async () => {
    if (!maCode.trim()) return toast.error('Nhập mã code');
    if (!tenMa.trim()) return toast.error('Nhập tên chương trình');
    if (!giaTriGiam || Number(giaTriGiam) <= 0) return toast.error('Giá trị giảm không hợp lệ');
    if (!batDau || !ketThuc) return toast.error('Chọn thời gian bắt đầu/kết thúc');

    const payload: MaGiamGiaPayload = {
      maCode: maCode.trim(),
      tenMa: tenMa.trim(),
      loaiGiam,
      giaTriGiam: Number(giaTriGiam),
      giaTriGiamToiDa: giaTriGiamToiDa ? Number(giaTriGiamToiDa) : null,
      dieuKienToiThieu: dieuKienToiThieu ? Number(dieuKienToiThieu) : null,
      soLuongToiDa: Number(soLuongToiDa) || 1,
      batDau: localInputToIso(batDau),
      ketThuc: localInputToIso(ketThuc),
      trangThai,
      sanPhamIds: apDung === 'SAN_PHAM' ? sanPhamIds : [],
    };

    setDangLuu(true);
    try {
      if (editing) await adminDiscountService.capNhat(editing.id, payload);
      else await adminDiscountService.taoMoi(payload);
      toast.success(editing ? 'Đã cập nhật mã' : 'Đã tạo mã giảm giá');
      onSaved();
    } catch { /* toasted */ } finally { setDangLuu(false); }
  };

  return (
    <Modal open title={editing ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'} size="lg" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Mã code *">
            <input className={inp} value={maCode} onChange={(e) => setMaCode(e.target.value.toUpperCase())} />
          </Field>
          <Field label="Tên chương trình *">
            <input className={inp} value={tenMa} onChange={(e) => setTenMa(e.target.value)} />
          </Field>
          <Field label="Loại giảm">
            <select className={inp} value={loaiGiam} onChange={(e) => setLoaiGiam(e.target.value)}>
              <option value="PHAN_TRAM">Phần trăm (%)</option>
              <option value="SO_TIEN_CO_DINH">Số tiền cố định (đ)</option>
            </select>
          </Field>
          <Field label={loaiGiam === 'PHAN_TRAM' ? 'Giá trị giảm (%)' : 'Giá trị giảm (đ)'}>
            <input type="number" className={inp} value={giaTriGiam} onChange={(e) => setGiaTriGiam(e.target.value)} />
          </Field>
          {loaiGiam === 'PHAN_TRAM' && (
            <Field label="Giảm tối đa (đ)">
              <input type="number" className={inp} value={giaTriGiamToiDa} onChange={(e) => setGiaTriGiamToiDa(e.target.value)} />
            </Field>
          )}
          <Field label="Đơn tối thiểu (đ)">
            <input type="number" className={inp} value={dieuKienToiThieu} onChange={(e) => setDieuKienToiThieu(e.target.value)} />
          </Field>
          <Field label="Số lượng tối đa">
            <input type="number" className={inp} value={soLuongToiDa} onChange={(e) => setSoLuongToiDa(e.target.value)} />
          </Field>
          <Field label="Trạng thái">
            <select className={inp} value={trangThai} onChange={(e) => setTrangThai(e.target.value)}>
              <option value="HOAT_DONG">Hoạt động</option>
              <option value="VO_HIEU">Vô hiệu</option>
            </select>
          </Field>
          <Field label="Bắt đầu *">
            <input type="datetime-local" className={inp} value={batDau} onChange={(e) => setBatDau(e.target.value)} />
          </Field>
          <Field label="Kết thúc *">
            <input type="datetime-local" className={inp} value={ketThuc} onChange={(e) => setKetThuc(e.target.value)} />
          </Field>
        </div>

        <Field label="Phạm vi áp dụng">
          <div className="flex gap-2">
            <TabBtn active={apDung === 'DON_HANG'} onClick={() => setApDung('DON_HANG')}>Toàn đơn</TabBtn>
            <TabBtn active={apDung === 'SAN_PHAM'} onClick={() => setApDung('SAN_PHAM')}>Sản phẩm cụ thể</TabBtn>
          </div>
        </Field>

        {apDung === 'SAN_PHAM' && (
          <div className="rounded-lg border border-gray-200 p-3">
            <input
              className={`${inp} mb-2`}
              placeholder="Tìm sản phẩm..."
              value={timSp}
              onChange={(e) => setTimSp(e.target.value)}
            />
            <p className="mb-2 text-xs text-gray-500">Đã chọn {sanPhamIds.length} sản phẩm</p>
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {(spList?.items ?? []).map((sp) => (
                <label key={sp.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={sanPhamIds.includes(sp.id)}
                    onChange={() => toggleSp(sp.id)}
                  />
                  <span className="truncate">{sp.tenSanPham}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
          <button onClick={onClose} disabled={dangLuu} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60">
            Quay lại
          </button>
          <button onClick={luu} disabled={dangLuu} className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
            {dangLuu ? 'Đang lưu...' : 'Lưu mã'}
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

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white'
          : 'rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100'
      }
    >
      {children}
    </button>
  );
}
