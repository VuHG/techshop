import axios from 'axios';

const aiUrl = process.env.NEXT_PUBLIC_AI_URL;

// Card sản phẩm AI gợi ý kèm trong câu trả lời.
export interface ChatProduct {
  slug: string;
  bienTheId: number;
  tenSanPham: string;
  anhChinh: string | null;
  gia: number;
  giaBan: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  products?: ChatProduct[];
}

export interface ChatResult {
  reply: string;
  products: ChatProduct[];
}

// Gọi thẳng AI Gateway (Phase 6) — KHÔNG qua backend, KHÔNG cần JWT.
export const aiService = {
  async chat(message: string, history: ChatMessage[]): Promise<ChatResult> {
    const res = await axios.post<{ success: boolean; reply: string; products?: ChatProduct[] }>(
      `${aiUrl}/chat`,
      // Chỉ gửi role + content cho lịch sử (bỏ products để gọn payload).
      { message, history: history.map((m) => ({ role: m.role, content: m.content })) },
      { timeout: 20000 },
    );
    return { reply: res.data.reply ?? '', products: res.data.products ?? [] };
  },
};
