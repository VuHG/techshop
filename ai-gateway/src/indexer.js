import { config } from './config.js';
import { getClient, ensureCollection, COLLECTION } from './qdrantClient.js';
import { embedText } from './embeddings.js';

let dangIndex = false;
let lanIndexCuoi = 0;

/** Lấy TOÀN BỘ sản phẩm (1 card / sản phẩm) từ backend để index. */
async function taiToanBoSanPham() {
  const res = await fetch(`${config.backendUrl}/san-pham?size=1000&sortBy=newest`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const raw = json?.data?.items ?? [];
  const seen = new Set();
  const items = [];
  for (const it of raw) {
    if (!it?.slug || seen.has(it.slug)) continue;
    seen.add(it.slug);
    items.push({
      slug: it.slug,
      bienTheId: it.bienTheId,
      tenSanPham: it.tenSanPham,
      thongSoBienThe: it.thongSoBienThe ?? {},
      anhChinh: it.anhChinh ?? null,
      gia: it.gia,
      giaBan: it.giaBan,
    });
  }
  return items;
}

/** Văn bản đại diện 1 sản phẩm để embed (tên + thông số). */
function vanBanSanPham(p) {
  const specs = Object.values(p.thongSoBienThe ?? {})
    .filter((v) => v != null && v !== '')
    .join(', ');
  return `${p.tenSanPham}${specs ? ' - ' + specs : ''}`;
}

/** Index toàn bộ sản phẩm vào Qdrant (embedding tên+thông số). An toàn: lỗi chỉ log. */
export async function indexAll() {
  const c = getClient();
  if (!c || dangIndex) return;
  dangIndex = true;
  try {
    const items = await taiToanBoSanPham();
    const coId = items.filter((p) => p.bienTheId != null);
    if (!coId.length) {
      lanIndexCuoi = Date.now();
      return;
    }
    // Embed tuần tự (số lượng nhỏ, tránh vượt rate-limit free tier).
    const vectors = [];
    for (const p of coId) vectors.push(await embedText(vanBanSanPham(p)));

    await ensureCollection(vectors[0].length);
    const points = coId.map((p, i) => ({ id: p.bienTheId, vector: vectors[i], payload: p }));
    await c.upsert(COLLECTION, { points, wait: true });

    lanIndexCuoi = Date.now();
    console.log(`[rag] Đã index ${points.length} sản phẩm vào Qdrant`);
  } catch (err) {
    console.error('[rag] Index lỗi:', err?.message ?? err);
  } finally {
    dangIndex = false;
  }
}

export function daIndex() {
  return lanIndexCuoi > 0;
}
