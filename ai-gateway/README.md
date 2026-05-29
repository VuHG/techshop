# TechShop AI Gateway

Service Node.js (Express) làm proxy tới Groq LLM cho chatbot tư vấn của TechShop.
Lịch sử hội thoại **chỉ theo session** (gửi kèm trong request), KHÔNG lưu database.

## Chạy local
```bash
cd ai-gateway
cp .env.example .env        # rồi điền GROQ_API_KEY
npm install
npm run dev                 # hoặc: npm start
```

## Endpoints
- `GET  /api/ai/health` → `{ "status": "OK", "model": "..." }`
- `POST /api/ai/chat`
  - Body: `{ "message": "string", "sessionId": "string?", "history": [{ "role": "user|assistant", "content": "string" }] }`
  - 200: `{ "success": true, "reply": "...", "sessionId": "..." }`
  - 400: tin nhắn rỗng hoặc > 1000 ký tự
  - 504: Groq timeout (mặc định 15s)
  - 503: lỗi Groq khác

## Cấu hình (.env)
| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `PORT` | 3001 | cổng chạy |
| `GROQ_API_KEY` | (bắt buộc) | key Groq |
| `GROQ_MODEL` | llama-3.3-70b-versatile | model Groq (đổi khi Groq cập nhật) |
| `CORS_ORIGINS` | http://localhost:3000 | origin FE được phép |
| `AI_TIMEOUT_MS` | 15000 | timeout gọi Groq |
