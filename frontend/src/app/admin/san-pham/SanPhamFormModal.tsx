'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Modal } from '../_components/Modal';
import { KeyValueEditor, kvToObject, objectToKv, type KV } from '../_components/KeyValueEditor';
import { UrlListEditor } from '../_components/UrlListEditor';
import { PRODUCT_STATUS_OPTIONS, VARIANT_STATUS_OPTIONS } from '../_lib/productStatus';
import {
  adminProductService,
  type AdminSanPhamDetail,
  type FormOptions,
  type SanPhamPayload,
} from '../_services/adminProductService';

interface FormBienThe {
  id?: number;
  maBienThe: string;
  specs: KV[];
  gia: string;
  giaKhuyenMai: string;
  soLuongTon: string;
  trangThai: string;
  anhUrls: string[];
  nhanIds: number[];
}

function bienTheRong(): FormBienThe {
  return {
    maBienThe: '',
    specs: [],
    gia: '',
    giaKhuyenMai: '',
    soLuongTon: '0',
    trangThai: 'CON_HANG',
    anhUrls: [],
    nhanIds: [],
  };
}

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
  const [moTaNgan, setMoTaNgan] = useState(editing?.moTaNgan ?? '');
  const [moTa, setMoTa] = useState(editing?.moTa ?? '');
  const [phanLoaiId, setPhanLoaiId] = useState<number | ''>(editing?.phanLoaiId ?? '');
  const [thuongHieu, setThuongHieu] = useState(editing?.thuongHieu ?? '');
  const [trangThai, setTrangThai] = useState(editing?.trangThai ?? 'CON_HANG');
  const [specs, setSpecs] = useState<KV[]>(objectToKv(editing?.thongSoKyThuat));
  const [bienThes, setBienThes] = useState<FormBienThe[]>(
    editing
      ? editing.bienThes.map((b) => ({
          id: b.id,
          maBienThe: b.maBienThe ?? '',
          specs: objectToKv(b.thongSoBienThe),
          gia: String(b.gia ?? ''),
          giaKhuyenMai: b.giaKhuyenMai != null ? String(b.giaKhuyenMai) : '',
          soLuongTon: String(b.soLuongTon ?? 0),
          trangThai: b.trangThai ?? 'CON_HANG',
          anhUrls: b.anhUrls ?? [],
          nhanIds: b.nhanIds ?? [],
        }))
      : [bienTheRong()],
  );
  const [dangLuu, setDangLuu] = useState(false);

  const suaBienThe = (i: number, patch: Partial<FormBienThe>) =>
    setBienThes((arr) => arr.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));

  const toggleNhan = (i: number, nhanId: number) =>
    setBienThes((arr) =>
      arr.map((b, idx) =>
        idx === i
          ? {
              ...b,
              nhanIds: b.nhanIds.includes(nhanId)
                ? b.nhanIds.filter((x) => x !== nhanId)
                : [...b.nhanIds, nhanId],
            }
          : b,
      ),
    );

  const luu = async () => {
    if (!tenSanPham.trim()) return toast.error('Vui lòng nhập tên sản phẩm');
    if (!phanLoaiId) return toast.error('Vui lòng chọn phân loại');
    if (bienThes.length === 0) return toast.error('Cần ít nhất một biến thể');
    for (const b of bienThes) {
      if (!b.gia || Number(b.gia) <= 0) return toast.error('Mỗi biến thể cần có giá hợp lệ');
    }

    const payload: SanPhamPayload = {
      tenSanPham: tenSanPham.trim(),
      slug: slug.trim() || undefined,
      moTa: moTa.trim() || undefined,
      moTaNgan: moTaNgan.trim() || undefined,
      phanLoaiId: Number(phanLoaiId),
      thuongHieu: thuongHieu.trim() || undefined,
      thongSoKyThuat: kvToObject(specs),
      trangThai,
      bienThes: bienThes.map((b) => ({
        id: b.id,
        maBienThe: b.maBienThe.trim() || null,
        thongSoBienThe: kvToObject(b.specs),
        gia: Number(b.gia),
        giaKhuyenMai: b.giaKhuyenMai ? Number(b.giaKhuyenMai) : null,
        soLuongTon: Number(b.soLuongTon) || 0,
        trangThai: b.trangThai,
        anhUrls: b.anhUrls.filter((u) => u.trim()),
        nhanIds: b.nhanIds,
      })),
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
    <Modal open title={editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'} size="xl" onClose={onClose}>
      <div className="space-y-5">
        {/* Thông tin chung */}
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
          <textarea
            className={inp}
            rows={3}
            value={moTa}
            onChange={(e) => setMoTa(e.target.value)}
          />
        </Field>

        <Field label="Thông số kỹ thuật chung">
          <KeyValueEditor rows={specs} onChange={setSpecs} />
        </Field>

        {/* Biến thể */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Biến thể ({bienThes.length})</h4>
            <button
              type="button"
              onClick={() => setBienThes((a) => [...a, bienTheRong()])}
              className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20"
            >
              <Plus className="h-4 w-4" /> Thêm biến thể
            </button>
          </div>

          <div className="space-y-4">
            {bienThes.map((b, i) => (
              <div key={i} className="rounded-xl border border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Biến thể #{i + 1}</span>
                  {bienThes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setBienThes((a) => a.filter((_, idx) => idx !== i))}
                      className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" /> Xóa
                    </button>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  <Field label="SKU">
                    <input
                      className={inp}
                      value={b.maBienThe}
                      onChange={(e) => suaBienThe(i, { maBienThe: e.target.value })}
                    />
                  </Field>
                  <Field label="Giá *">
                    <input
                      type="number"
                      className={inp}
                      value={b.gia}
                      onChange={(e) => suaBienThe(i, { gia: e.target.value })}
                    />
                  </Field>
                  <Field label="Giá khuyến mãi">
                    <input
                      type="number"
                      className={inp}
                      value={b.giaKhuyenMai}
                      onChange={(e) => suaBienThe(i, { giaKhuyenMai: e.target.value })}
                    />
                  </Field>
                  <Field label="Tồn kho">
                    <input
                      type="number"
                      className={inp}
                      value={b.soLuongTon}
                      onChange={(e) => suaBienThe(i, { soLuongTon: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <Field label="Trạng thái biến thể">
                    <select
                      className={inp}
                      value={b.trangThai}
                      onChange={(e) => suaBienThe(i, { trangThai: e.target.value })}
                    >
                      {VARIANT_STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Nhãn">
                    <div className="flex flex-wrap gap-1.5">
                      {options.nhans.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => toggleNhan(i, n.id)}
                          className={cn(
                            'rounded-full px-2.5 py-1 text-xs font-medium ring-1 transition',
                            b.nhanIds.includes(n.id)
                              ? 'bg-primary text-white ring-primary'
                              : 'bg-white text-gray-600 ring-gray-300 hover:bg-gray-100',
                          )}
                        >
                          {n.tenNhan}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>

                <div className="mt-3">
                  <Field label="Thông số biến thể">
                    <KeyValueEditor
                      rows={b.specs}
                      onChange={(rows) => suaBienThe(i, { specs: rows })}
                    />
                  </Field>
                </div>

                <div className="mt-3">
                  <Field label="Ảnh biến thể">
                    <UrlListEditor
                      urls={b.anhUrls}
                      onChange={(urls) => suaBienThe(i, { anhUrls: urls })}
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hành động */}
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

const inp =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}
