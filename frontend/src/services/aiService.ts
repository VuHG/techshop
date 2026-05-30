import axios from 'axios';

const aiUrl = process.env.NEXT_PUBLIC_AI_URL;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Gọi thẳng AI Gateway (Phase 6) — KHÔNG qua backend, KHÔNG cần JWT.
export const aiService = {
  async chat(message: string, history: ChatMessage[]): Promise<string> {
    const res = await axios.post<{ success: boolean; reply: string }>(
      `${aiUrl}/chat`,
      { message, history },
      { timeout: 20000 },
    );
    return res.data.reply ?? '';
  },
};
