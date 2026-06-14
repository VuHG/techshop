import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { queryClient } from '@/lib/queryClient';
import type { ApiError, ApiResponse, AuthTokens } from '@/types';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

// Thao tác ghi dữ liệu → sau khi thành công sẽ làm mới toàn bộ dữ liệu đang hiển thị.
const PHUONG_THUC_GHI = ['post', 'put', 'patch', 'delete'];

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// --- Request: đính access token ---
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Response: tự refresh khi 401, toast lỗi ---
interface RetriableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Gom các request 401 trong lúc đang refresh để không refresh nhiều lần.
let dangRefresh = false;
let hangCho: ((token: string | null) => void)[] = [];

function thongBaoHangCho(token: string | null) {
  hangCho.forEach((cb) => cb(token));
  hangCho = [];
}

async function lamMoiToken(): Promise<string | null> {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();
  if (!refreshToken) return null;
  try {
    const res = await axios.post<ApiResponse<AuthTokens>>(`${baseURL}/auth/refresh`, {
      refreshToken,
    });
    const { accessToken, refreshToken: moi } = res.data.data;
    setTokens(accessToken, moi);
    return accessToken;
  } catch {
    logout();
    return null;
  }
}

api.interceptors.response.use(
  (res) => {
    // Sau MỌI thao tác ghi DB (mua hàng, hủy, đánh giá, sửa hồ sơ/địa chỉ, giỏ hàng...) thành công
    // → invalidate toàn bộ query để trang tự refetch, hiển thị đúng với cơ sở dữ liệu.
    const method = (res.config.method ?? '').toLowerCase();
    const isAuth = res.config.url?.includes('/auth/') ?? false;
    if (PHUONG_THUC_GHI.includes(method) && !isAuth && typeof window !== 'undefined') {
      queryClient.invalidateQueries();
    }
    return res;
  },
  async (error: AxiosError<ApiError>) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    // Endpoint auth (đăng nhập/đăng ký/refresh...) KHÔNG refresh: 401 ở đây là sai
    // thông tin đăng nhập, phải để trang tự hiển thị lỗi.
    const isAuthEndpoint = original?.url?.includes('/auth/') ?? false;

    // 401 -> thử refresh một lần (trừ endpoint auth)
    if (status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;

      if (dangRefresh) {
        // Chờ lần refresh đang chạy hoàn tất rồi retry.
        return new Promise((resolve, reject) => {
          hangCho.push((token) => {
            if (!token) return reject(error);
            original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
            resolve(api(original));
          });
        });
      }

      dangRefresh = true;
      const token = await lamMoiToken();
      dangRefresh = false;
      thongBaoHangCho(token);

      if (token) {
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
        return api(original);
      }
      if (typeof window !== 'undefined') {
        toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        window.location.href = '/dang-nhap';
      }
      return Promise.reject(error);
    }

    // Toast thông điệp lỗi từ backend. Bỏ qua 401 non-auth (đã xử lý refresh ở trên),
    // nhưng VẪN toast lỗi 401 của endpoint auth (vd sai mật khẩu).
    const message = error.response?.data?.message;
    const da401NonAuth = status === 401 && !isAuthEndpoint;
    if (message && !da401NonAuth && typeof window !== 'undefined') {
      toast.error(message);
    }
    return Promise.reject(error);
  },
);
