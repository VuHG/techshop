import { Router } from 'express';
import { config } from './config.js';
import { chat } from './geminiService.js';
import { getCatalog } from './productCatalog.js';
import { retrieve } from './retriever.js';
import { daIndex } from './indexer.js';

export const router = Router();

// Tách dòng marker [[SP: slug-a, slug-b]] khỏi câu trả lời → map sang card sản phẩm.
function taySanPham(rawReply, catalog) {
  const m = rawReply.match(/\[\[SP:\s*([^\]]+)\]\]/i);
  if (!m) return { reply: rawReply.trim(), products: [] };

  const reply = rawReply.replace(m[0], '').trim();
  const seen = new Set();
  const products = [];
  for (const slug of m[1].split(',').map((s) => s.trim()).filter(Boolean)) {
    if (seen.has(slug)) continue;
    const p = catalog.find((c) => c.slug === slug);
    if (p) {
      seen.add(slug);
      products.push(p);
    }
    if (products.length >= 4) break;
  }
  return { reply, products };
}

router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    model: config.geminiModel,
    rag: config.qdrantUrl ? (daIndex() ? 'ready' : 'indexing') : 'off',
  });
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
    // RAG: tìm ngữ nghĩa toàn kho qua Qdrant; lỗi/tắt → fallback catalog top-40 như cũ.
    const relevant = await retrieve(message.trim());
    const catalog = relevant && relevant.length ? relevant : await getCatalog();
    const rawReply = await chat(message.trim(), safeHistory, catalog);
    const { reply, products } = taySanPham(rawReply, catalog);
    return res.json({ success: true, reply, products, sessionId: sessionId ?? null });
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
    console.error('[ai] Gemini error:', err?.status ?? '', err?.message ?? err);
    return res
      .status(503)
      .json({ success: false, error: 'Trợ lý ảo hiện đang bảo trì, vui lòng thử lại sau' });
  }
});
