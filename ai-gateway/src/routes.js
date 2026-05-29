import { Router } from 'express';
import { config } from './config.js';
import { chat } from './geminiService.js';

export const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'OK', model: config.geminiModel });
});

router.post('/chat', async (req, res) => {
  const { message, sessionId, history } = req.body ?? {};

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ success: false, error: 'Tin nhắn không được rỗng' });
  }
  if (message.length > config.maxMessageLength) {
    return res
      .status(400)
      .json({ success: false, error: `Tin nhắn tối đa ${config.maxMessageLength} ký tự` });
  }

  // Chỉ giữ lịch sử hợp lệ (role user/assistant + content chuỗi). Session-only, KHÔNG lưu DB.
  const safeHistory = Array.isArray(history)
    ? history
        .filter(
          (m) =>
            m &&
            (m.role === 'user' || m.role === 'assistant') &&
            typeof m.content === 'string' &&
            m.content.trim(),
        )
        .map((m) => ({ role: m.role, content: m.content }))
    : [];

  try {
    const reply = await chat(message.trim(), safeHistory);
    return res.json({ success: true, reply, sessionId: sessionId ?? null });
  } catch (err) {
    const isTimeout =
      err?.name === 'TimeoutError' ||
      err?.name === 'AbortError' ||
      err?.code === 'ETIMEDOUT';
    if (isTimeout) {
      return res
        .status(504)
        .json({ success: false, error: 'Hệ thống AI đang quá tải, vui lòng thử lại sau' });
    }
    console.error('[ai] Groq error:', err?.status ?? '', err?.message ?? err);
    return res
      .status(503)
      .json({ success: false, error: 'Trợ lý ảo hiện đang bảo trì, vui lòng thử lại sau' });
  }
});
