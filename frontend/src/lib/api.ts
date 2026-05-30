import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import type { ApiError, ApiResponse, AuthTokens } from '@/types';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

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
  (res) => res,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    // 401 -> thử refresh một lần
    if (status === 401 && original && !original._retry) {
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

    // Toast thông điệp lỗi từ backend (nếu có), bỏ qua 401 đã xử lý ở trên.
    const message = error.response?.data?.message;
    if (message && status !== 401 && typeof window !== 'undefined') {
      toast.error(message);
    }
    return Promise.reject(error);
  },
);
