'use client';

import { useEffect } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

/**
 * Hiển thị con trỏ "đang xử lý" (vòng tròn quay) bất cứ khi nào có request đang chạy
 * (query đang fetch hoặc mutation đang gửi) — để người dùng biết trang đang tải dữ liệu
 * từ backend, không phải màn hình bị đơ. Áp dụng toàn site (cả trang quản lý lẫn người dùng).
 */
export function GlobalLoadingCursor() {
  const dangFetch = useIsFetching();
  const dangMutate = useIsMutating();
  const dangBan = dangFetch + dangMutate > 0;

  useEffect(() => {
    document.body.classList.toggle('app-busy', dangBan);
    return () => document.body.classList.remove('app-busy');
  }, [dangBan]);

  return null;
}
