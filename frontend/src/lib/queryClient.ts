import { QueryClient } from '@tanstack/react-query';

// QueryClient dùng chung (singleton) — để cả React tree lẫn axios interceptor truy cập được.
// Sau mỗi thao tác ghi (POST/PUT/PATCH/DELETE) interceptor sẽ invalidate toàn bộ query
// → mọi dữ liệu đang hiển thị tự refetch lại đúng với cơ sở dữ liệu.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
