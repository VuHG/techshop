import { GoogleGenAI } from '@google/genai';
import { config } from './config.js';
import { buildSystemInstruction } from './systemPrompt.js';

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

// Chặn request quá lâu (Gemini SDK không đảm bảo timeout) — race với một timer.
function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const e = new Error('AI request timeout');
      e.name = 'TimeoutError';
      reject(e);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Gọi Gemini để sinh câu trả lời tư vấn.
 * @param {string} message  câu hỏi của khách (đã validate, đã trim)
 * @param {{role:'user'|'assistant', content:string}[]} history  lịch sử (đã lọc)
 * @param {Array} catalog  danh sách sản phẩm thật để AI gợi ý (có thể rỗng)
 * @returns {Promise<string>} nội dung trả lời (có thể kèm dòng marker [[SP: ...]])
 */
export async function chat(message, history = [], catalog = []) {
  // Gemini dùng role 'user' | 'model' và cấu trúc parts[].
  const contents = [
    ...history.slice(-config.maxHistory).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const request = ai.models.generateContent({
    model: config.geminiModel,
    contents,
    config: {
      systemInstruction: buildSystemInstruction(catalog),
      maxOutputTokens: 1500,
      temperature: 0.7,
      // Tắt "thinking" để tiết kiệm token + giảm độ trễ (chỉ áp với 2.5-flash trở lên,
      // các model khác bỏ qua field này — không lỗi).
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  const response = await withTimeout(request, config.requestTimeoutMs);
  const text = typeof response.text === 'function' ? response.text() : response.text;
  return (text ?? '').trim();
}
