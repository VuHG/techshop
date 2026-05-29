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
  groqApiKey: required('GROQ_API_KEY'),
  // Tên model Groq có thể thay đổi theo thời gian — để env hóa, đổi không cần sửa code.
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  requestTimeoutMs: Number(process.env.AI_TIMEOUT_MS) || 15000,
  maxMessageLength: 1000,
  maxHistory: 6,
};
