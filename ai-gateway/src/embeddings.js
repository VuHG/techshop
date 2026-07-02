import { GoogleGenAI } from '@google/genai';
import { config } from './config.js';

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

/**
 * Tạo vector embedding cho 1 đoạn text bằng Gemini (mặc định text-embedding-004, 768 chiều).
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function embedText(text) {
  const resp = await ai.models.embedContent({
    model: config.embedModel,
    contents: text,
  });
  // Tùy phiên bản SDK: { embeddings: [{ values }] } hoặc { embedding: { values } }.
  const values = resp?.embeddings?.[0]?.values ?? resp?.embedding?.values;
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('Không lấy được vector embedding từ Gemini');
  }
  return values;
}
