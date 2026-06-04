import { config } from './config.js';

// Cache danh sách sản phẩm trong RAM (TTL 5 phút) — tránh gọi backend mỗi tin nhắn.
const TTL_MS = 5 * 60 * 1000;
let cache = { at: 0, items: [] };

/**
 * Lấy danh sách sản phẩm rút gọn (1 card / sản phẩm) từ backend để AI gợi ý.
 * Lỗi backend → giữ cache cũ (hoặc rỗng) để chat vẫn hoạt động.
 * @returns {Promise<Array<{slug:string,bienTheId:number,tenSanPham:string,thongSoBienThe:object,anhChinh:string|null,gia:number,giaBan:number}>>}
 */
export async function getCatalog() {
  if (cache.items.length && Date.now() - cache.at < TTL_MS) return cache.items;
  try {
    const res = await fetch(`${config.backendUrl}/san-pham?size=40&sortBy=sold`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const raw = json?.data?.items ?? [];
    const seen = new Set();
    const items = [];
    for (const it of raw) {
      if (!it?.slug || seen.has(it.slug)) continue; // 1 sản phẩm = 1 card
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
    cache = { at: Date.now(), items };
  } catch (err) {
    console.error('[ai] Không lấy được danh sách sản phẩm:', err?.message ?? err);
    // Giữ nguyên cache cũ nếu có.
  }
  return cache.items;
}
