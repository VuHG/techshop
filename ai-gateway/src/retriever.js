import { config } from './config.js';
import { getClient, COLLECTION } from './qdrantClient.js';
import { embedText } from './embeddings.js';
import { indexAll, daIndex } from './indexer.js';

/**
 * Tìm ngữ nghĩa top-k sản phẩm liên quan câu hỏi qua Qdrant.
 * @returns {Promise<Array|null>} danh sách payload sản phẩm, hoặc null để routes fallback catalog cũ.
 */
export async function retrieve(query, k = config.ragTopK) {
  const c = getClient();
  if (!c) return null; // RAG tắt (không cấu hình Qdrant) → dùng catalog cũ
  try {
    if (!daIndex()) await indexAll(); // lần đầu chưa index thì index trước
    const vector = await embedText(query);
    const hits = await c.search(COLLECTION, { vector, limit: k, with_payload: true });
    if (!hits?.length) return null;
    return hits.map((h) => h.payload).filter(Boolean);
  } catch (err) {
    console.error('[rag] Retrieve lỗi (fallback catalog):', err?.message ?? err);
    return null;
  }
}
