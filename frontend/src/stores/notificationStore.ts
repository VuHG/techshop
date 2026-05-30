import { create } from 'zustand';

// Số thông báo chưa đọc (poll ở Phase 10). Không persist — luôn lấy mới từ server.
interface NotificationState {
  soChuaDoc: number;
  setSoChuaDoc: (n: number) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  soChuaDoc: 0,
  setSoChuaDoc: (n) => set({ soChuaDoc: n }),
}));
