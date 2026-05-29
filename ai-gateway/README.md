# TechShop AI Gateway

Service Node.js (Express) làm proxy tới **Google Gemini** cho chatbot tư vấn của TechShop.
Lịch sử hội thoại **chỉ theo session** (gửi kèm trong request), KHÔNG lưu database.
Nhà cung cấp LLM được cô lập trong `src/geminiService.js` — đổi sang Groq/GPT chỉ cần sửa file này + `.env`.

## Chạy local
```bash
cd ai-gateway
cp .env.example .env        # rồi điền GEMINI_API_KEY
npm install
npm run dev                 # hoặc: npm start
```

## Endpoints
- `GET  /api/ai/health` → `{ "status": "OK", "model": "..." }`
- `POST /api/ai/chat`
  - Body: `{ "message": "string", "sessionId": "string?", "history": [{ "role": "user|assistant", "content": "string" }] }`
  - 200: `{ "success": true, "reply": "...", "sessionId": "..." }`
  - 400: tin nhắn rỗng hoặc > 1000 ký tự
  - 504: Gemini timeout (mặc định 15s)
  - 503: lỗi Gemini khác

## Cấu hình (.env)
| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `PORT` | 3001 | cổng chạy |
| `GEMINI_API_KEY` | (bắt buộc) | key Gemini (aistudio.google.com/app/apikey) |
| `GEMINI_MODEL` | gemini-2.0-flash | model Gemini (đổi khi Google cập nhật) |
| `CORS_ORIGINS` | http://localhost:3000 | origin FE được phép |
| `AI_TIMEOUT_MS` | 15000 | timeout gọi Gemini |
