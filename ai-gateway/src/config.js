import dotenv from 'dotenv';

dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`[config] Thiếu biến môi trường bắt buộc: ${name}. Hãy tạo file .env (xem .env.example).`);
    process.exit(1);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT) || 3001,
  geminiApiKey: required('GEMINI_API_KEY'),
  // URL gốc API backend để lấy danh sách sản phẩm (server-to-server, cùng host).
  backendUrl: process.env.BACKEND_URL || 'http://localhost:8080/api',
  // Tên model Gemini có thể thay đổi theo thời gian — để env hóa, đổi không cần sửa code.
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  requestTimeoutMs: Number(process.env.AI_TIMEOUT_MS) || 15000,
  maxMessageLength: 1000,
  maxHistory: 6,
};
