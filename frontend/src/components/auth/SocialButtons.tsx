'use client';

import toast from 'react-hot-toast';

// Đăng nhập MXH NẰM NGOÀI MVP — hiển thị nút theo thiết kế nhưng vô hiệu hóa.
const SAP_CO = () => toast('Đăng nhập mạng xã hội sẽ sớm ra mắt', { icon: '🔒' });

export function SocialButtons({ loai }: { loai: 'dang-nhap' | 'dang-ky' }) {
  const nhan = loai === 'dang-nhap' ? 'Hoặc đăng nhập bằng' : 'Đăng ký bằng tài khoản mạng xã hội';
  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        {nhan}
        <span className="h-px flex-1 bg-gray-200" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={SAP_CO}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <span className="text-base font-bold text-[#EA4335]">G</span> Google
        </button>
        <button
          type="button"
          onClick={SAP_CO}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <span className="text-base font-bold text-primary">Z</span> Zalo
        </button>
      </div>
    </div>
  );
}
