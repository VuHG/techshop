'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Modal } from '../_components/Modal';
import { adminUserService } from '../_services/adminUserService';

export function ResetMatKhauModal({ id, onClose }: { id: number; onClose: () => void }) {
  const [matKhau, setMatKhau] = useState('');
  const [dangLuu, setDangLuu] = useState(false);

  const luu = async () => {
    if (matKhau.length < 6) return toast.error('Mật khẩu tối thiểu 6 ký tự');
    setDangLuu(true);
    try {
      await adminUserService.resetMatKhau(id, matKhau);
      toast.success('Đã đặt lại mật khẩu');
      onClose();
    } catch { /* toasted */ } finally { setDangLuu(false); }
  };

  return (
    <Modal open title="Đặt lại mật khẩu" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm text-gray-500">
          Người dùng sẽ bị đăng xuất khỏi mọi phiên sau khi đổi mật khẩu.
        </p>
        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} disabled={dangLuu} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-60">
            Quay lại
          </button>
          <button onClick={luu} disabled={dangLuu} className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
            {dangLuu ? 'Đang lưu...' : 'Đặt lại'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
