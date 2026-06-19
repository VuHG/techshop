'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '../_components/Modal';
import { PRODUCT_STATUS_OPTIONS } from '../_lib/productStatus';
import {
  adminProductService,
  type AdminSanPhamDetail,
  type FormOptions,
  type SanPhamPayload,
} from '../_services/adminProductService';

const inp =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

/**
 * Form "hộp chứa" sản phẩm: chỉ thông tin chung + ảnh.
 * Biến thể được quản lý riêng qua nút "Thêm biến thể" ở từng dòng sản phẩm.
 */
export function SanPhamFormModal({
  options,
  editing,
  onClose,
  onSaved,
}: {
  options: FormOptions;
  editing: AdminSanPhamDetail | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [tenSanPham, setTenSanPham] = useState(editing?.tenSanPham ?? '');
  const [slug, setSlug] = useState(editing?.slug ?? '');
  const [phanLoaiId, setPhanLoaiId] = useState<number | ''>(editing?.phanLoaiId ?? '');
  const [thuongHieu, setThuongHieu] = useState(editing?.thuongHieu ?? '');
  const [moTaNgan, setMoTaNgan] = useState(editing?.moTaNgan ?? '');
  const [moTa, setMoTa] = useState(editing?.moTa ?? '');
  const [trangThai, setTrangThai] = useState(editing?.trangThai ?? 'CON_HANG');
  const [anhDaiDien, setAnhDaiDien] = useState(editing?.anhDaiDien ?? '');
  const [dangLuu, setDangLuu] = useState(false);

  const luu = async () => {
    if (!tenSanPham.trim()) return toast.error('Vui lòng nhập tên sản phẩm');
    if (!phanLoaiId) return toast.error('Vui lòng chọn phân loại');

    const payload: SanPhamPayload = {
      tenSanPham: tenSanPham.trim(),
      slug: slug.trim() || undefined,
      moTa: moTa.trim() || undefined,
      moTaNgan: moTaNgan.trim() || undefined,
      phanLoaiId: Number(phanLoaiId),
      thuongHieu: thuongHieu.trim() || undefined,
      trangThai,
      anhDaiDien: anhDaiDien.trim(),
      // Thẻ gắn ở từng BIẾN THỂ (không ở sản phẩm) → không gửi ở form này.
      // KHÔNG gửi bienThes → giữ nguyên biến thể khi sửa hộp chứa.
    };

    setDangLuu(true);
    try {
      if (editing) await adminProductService.capNhat(editing.id, payload);
      else await adminProductService.taoMoi(payload);
      toast.success(editing ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm');
      onSaved();
    } catch {
      // interceptor đã toast lỗi
    } finally {
      setDangLuu(false);
    }
  };

  return (
    <Modal open title={editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'} size="lg" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tên sản phẩm *">
            <input className={inp} value={tenSanPham} onChange={(e) => setTenSanPham(e.target.value)} />
          </Field>
          <Field label="Slug (để trống = tự sinh)">
            <input className={inp} value={slug} onChange={(e) => setSlug(e.target.value)} />
          </Field>
          <Field label="Phân loại *">
            <select
              className={inp}
              value={phanLoaiId}
              onChange={(e) => setPhanLoaiId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">— Chọn phân loại —</option>
              {options.phanLoais.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.tenDanhMuc} › {p.tenPhanLoai}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Thương hiệu">
            <input className={inp} value={thuongHieu} onChange={(e) => setThuongHieu(e.target.value)} />
          </Field>
          <Field label="Trạng thái">
            <select className={inp} value={trangThai} onChange={(e) => setTrangThai(e.target.value)}>
              {PRODUCT_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Mô tả ngắn">
            <input className={inp} value={moTaNgan} onChange={(e) => setMoTaNgan(e.target.value)} />
          </Field>
        </div>

        <Field label="Mô tả chi tiết">
          <textarea className={inp} rows={4} value={moTa} onChange={(e) => setMoTa(e.target.value)} />
        </Field>

        <Field label="Ảnh đại diện (URL)">
          <input
            className={inp}
            value={anhDaiDien}
            onChange={(e) => setAnhDaiDien(e.target.value)}
            placeholder="https://... (ảnh dùng cho trang quản lý / banner)"
          />
          {anhDaiDien.trim() && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={anhDaiDien.trim()} alt="Ảnh đại diện" className="mt-2 h-24 w-24 rounded-lg border border-gray-200 object-cover" />
          )}
        </Field>

        <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={dangLuu}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={luu}
            disabled={dangLuu}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {dangLuu ? 'Đang lưu...' : 'Lưu sản phẩm'}
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
