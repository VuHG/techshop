import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from './config.js';

export const COLLECTION = 'products';

let client = null;

/** Trả client Qdrant, hoặc null nếu RAG tắt (không cấu hình QDRANT_URL). */
export function getClient() {
  if (!config.qdrantUrl) return null;
  if (!client) client = new QdrantClient({ url: config.qdrantUrl });
  return client;
}

/** Tạo collection nếu chưa có (kích thước vector = dim của model embedding). */
export async function ensureCollection(size) {
  const c = getClient();
  if (!c) return false;
  const { collections } = await c.getCollections();
  if (!collections.some((x) => x.name === COLLECTION)) {
    await c.createCollection(COLLECTION, {
      vectors: { size, distance: 'Cosine' },
    });
  }
  return true;
}
