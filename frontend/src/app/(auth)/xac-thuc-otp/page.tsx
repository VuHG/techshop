'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { OtpInput } from '@/components/ui/OtpInput';

function XacThucOtpInner() {
  const router = useRouter();
  const params = useSearchParams();
  const sdt = params.get('sdt') ?? '';
  const setAuth = useAuthStore((s) => s.setAuth);

  const [otp, setOtp] = useState('');
  const [dangGui, setDangGui] = useState(false);
  const [demNguoc, setDemNguoc] = useState(60);

  // Đếm ngược cho phép gửi lại OTP.
  useEffect(() => {
    if (demNguoc <= 0) return;
    const id = setTimeout(() => setDemNguoc((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [demNguoc]);

  if (!sdt) {
    return (
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-gray-600">Thiếu số điện thoại. Vui lòng đăng ký lại.</p>
        <Link href="/dang-ky" className="mt-4 inline-block text-primary hover:underline">
          Về trang đăng ký
        </Link>
      </div>
    );
  }

  const xacNhan = async () => {
    if (otp.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 chữ số OTP');
      return;
    }
    setDangGui(true);
    try {
      const res = await authService.xacThucOtp(sdt, otp);
      setAuth(res.nguoiDung, res.accessToken, res.refreshToken);
      toast.success('Kích hoạt tài khoản thành công');
      router.push('/');
    } catch {
      // interceptor đã toast
    } finally {
      setDangGui(false);
    }
  };

  const guiLai = async () => {
    try {
      await authService.guiLaiOtp(sdt);
      toast.success('Đã gửi lại mã OTP qua email');
      setDemNguoc(60);
      setOtp('');
    } catch {
      // interceptor đã toast
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
      <h1 className="mb-2 text-2xl font-bold text-primary">KÍCH HOẠT TÀI KHOẢN</h1>
      <p className="mb-6 text-sm text-gray-600">
        Vui lòng nhập mã OTP được gửi qua <strong>Email</strong>
      </p>

      <OtpInput value={otp} onChange={setOtp} />

      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={xacNhan}
          disabled={dangGui}
          className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
        >
          {dangGui ? 'Đang xử lý...' : 'Xác nhận'}
        </button>
        <Link
          href="/dang-ky"
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-gray-700 transition hover:bg-gray-50"
        >
          Quay lại
        </Link>
      </div>

      <p className="mt-4 text-xs text-gray-400">(Mã OTP có thời hạn 5 phút)</p>
      <div className="mt-2 text-sm">
        {demNguoc > 0 ? (
          <span className="text-gray-400">Gửi lại mã sau {demNguoc}s</span>
        ) : (
          <button type="button" onClick={guiLai} className="font-medium text-primary hover:underline">
            Gửi lại mã OTP
          </button>
        )}
      </div>
    </div>
  );
}

export default function XacThucOtpPage() {
  return (
    <Suspense fallback={<div className="text-gray-500">Đang tải...</div>}>
      <XacThucOtpInner />
    </Suspense>
  );
}
