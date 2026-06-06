'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '../_components/Modal';
import { adminUserService, type AdminNguoiDung } from '../_services/adminUserService';

const inp =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

export function NguoiDungFormModal({
  editing,
  onClose,
  onSaved,
}: {
  editing: AdminNguoiDung | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [hoTen, setHoTen] = useState(editing?.hoTen ?? '');
  const [soDienThoai, setSoDienThoai] = useState(editing?.soDienThoai ?? '');
  const [email, setEmail] = useState(editing?.email ?? '');
  const [ngaySinh, setNgaySinh] = useState(editing?.ngaySinh ?? '');
  const [matKhau, setMatKhau] = useState('');
  const [vaiTro, setVaiTro] = useState(editing?.vaiTro ?? 'CUSTOMER');
  const [dangLuu, setDangLuu] = useState(false);

  const luu = async () => {
    if (!hoTen.trim()) return toast.error('Nhập họ tên');
    if (!editing) {
      if (!soDienThoai.trim()) return toast.error('Nhập số điện thoại');
      if (matKhau.length < 6) return toast.error('Mật khẩu tối thiểu 6 ký tự');
    }
    setDangLuu(true);
    try {
      if (editing) {
        await adminUserService.capNhat(editing.id, {
          hoTen: hoTen.trim(),
          email: email.trim() || undefined,
          ngaySinh: ngaySinh || undefined,
          vaiTro,
        });
      } else {
        await adminUserService.taoMoi({
          hoTen: hoTen.trim(),
          soDienThoai: soDienThoai.trim(),
          email: email.trim() || undefined,
          ngaySinh: ngaySinh || undefined,
          matKhau,
          vaiTro,
        });
      }
      toast.success(editing ? 'Đã cập nhật tài khoản' : 'Đã tạo tài khoản');
      onSaved();
    } catch { /* toasted */ } finally { setDangLuu(false); }
  };

  return (
    <Modal open title={editing ? 'Sửa tài khoản' : 'Thêm tài khoản'} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Họ tên *">
          <input className={inp} value={hoTen} onChange={(e) => setHoTen(e.target.value)} />
        </Field>
        {!editing && (
          <Field label="Số điện thoại *">
            <input className={inp} value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} />
          </Field>
        )}
        <Field label="Email">
          <input className={inp} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Ngày sinh">
          <input className={inp} type="date" value={ngaySinh ?? ''} onChange={(e) => setNgaySinh(e.target.value)} />
        </Field>
        {!editing && (
          <Field label="Mật khẩu *">
            <input className={inp} type="password" value={matKhau} onChange={(e) => setMatKhau(e.target.value)} />
          </Field>
        )}
        <Field label="Vai trò">
          <select className={inp} value={vaiTro} onChange={(e) => setVaiTro(e.target.value)}>
            <option value="CUSTOMER">Khách hàng</option>
            <option value="ADMIN">Quản trị</option>
          </select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} disabled={dangLuu} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60">
            Quay lại
          </button>
          <button onClick={luu} disabled={dangLuu} className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
            {dangLuu ? 'Đang lưu...' : 'Lưu'}
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
