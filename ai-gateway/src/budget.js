/**
 * Phân tích NGÂN SÁCH từ câu hỏi tiếng Việt và lọc sản phẩm theo tầm giá.
 * Ví dụ hiểu được: "laptop 20 triệu", "tầm 15tr", "dưới 10 triệu", "từ 20 củ",
 * "15 - 20 triệu", "khoảng 500k", "20000000".
 */

const DVT = '(tri[ệe]u|tr|c[ủu]|ngh[ìi]n|ng[àa]n|k)';

function donVi(u) {
  return /^(tri|tr|c[ủu])/i.test(u) ? 1_000_000 : 1_000; // triệu/tr/củ = 1tr ; nghìn/ngàn/k = 1k
}
function soTien(s, u) {
  return Math.round(parseFloat(s.replace(',', '.')) * donVi(u));
}

/** @returns {{min:number,max:number,target:number}|null} */
export function parseBudget(text) {
  if (!text) return null;
  const t = text.toLowerCase();
  let m;

  // Khoảng: "15 - 20 triệu"
  m = t.match(new RegExp(`(\\d+[.,]?\\d*)\\s*(?:-|–|đến|tới)\\s*(\\d+[.,]?\\d*)\\s*${DVT}\\b`, 'i'));
  if (m) {
    const u = donVi(m[3]);
    const a = Math.round(parseFloat(m[1].replace(',', '.')) * u);
    const b = Math.round(parseFloat(m[2].replace(',', '.')) * u);
    return { min: Math.min(a, b), max: Math.max(a, b), target: (a + b) / 2 };
  }
  // "dưới / tối đa / không quá X"
  m = t.match(new RegExp(`(?:dưới|tối đa|không quá|nhỏ hơn|<=?)\\s*(\\d+[.,]?\\d*)\\s*${DVT}\\b`, 'i'));
  if (m) {
    const v = soTien(m[1], m[2]);
    return { min: 0, max: v, target: v };
  }
  // "trên / từ / hơn X"
  m = t.match(new RegExp(`(?:trên|từ|hơn|>=?)\\s*(\\d+[.,]?\\d*)\\s*${DVT}\\b`, 'i'));
  if (m) {
    const v = soTien(m[1], m[2]);
    return { min: v, max: Number.MAX_SAFE_INTEGER, target: v };
  }
  // "khoảng / tầm / cỡ / X triệu" → coi là mục tiêu, dao động ±20%
  m = t.match(new RegExp(`(?:khoảng|tầm|cỡ|~|giá)?\\s*(\\d+[.,]?\\d*)\\s*${DVT}\\b`, 'i'));
  if (m) {
    const v = soTien(m[1], m[2]);
    return { min: Math.round(v * 0.8), max: Math.round(v * 1.2), target: v };
  }
  // Số lớn viết đủ: "20000000"
  m = t.match(/(\d{7,})/);
  if (m) {
    const v = parseInt(m[1], 10);
    return { min: Math.round(v * 0.8), max: Math.round(v * 1.2), target: v };
  }
  return null;
}

function giaCua(p) {
  return typeof p.giaBan === 'number' ? p.giaBan : typeof p.gia === 'number' ? p.gia : 0;
}

/**
 * Lọc danh sách theo ngân sách. Có SP trong tầm giá → trả các SP đó (sắp theo gần target).
 * Không có SP nào trong tầm → trả cả danh sách nhưng SẮP theo gần target (để AI gợi ý gần nhất).
 */
export function locNganSach(list, budget) {
  if (!budget || !Array.isArray(list) || !list.length) return list;
  const target = budget.target ?? (budget.min + budget.max) / 2;
  const gan = (a, b) => Math.abs(giaCua(a) - target) - Math.abs(giaCua(b) - target);
  const trongTam = list.filter((p) => {
    const g = giaCua(p);
    return g >= budget.min && g <= budget.max;
  });
  return (trongTam.length ? trongTam : [...list]).sort(gan);
}
