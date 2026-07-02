import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import { router } from './routes.js';
import { indexAll } from './indexer.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigins }));
app.use(express.json({ limit: '16kb' }));
app.use(morgan('dev'));

app.use('/api/ai', router);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Không tìm thấy endpoint' });
});

app.listen(config.port, () => {
  console.log(
    `TechShop AI Gateway chạy tại http://localhost:${config.port} (model: ${config.geminiModel})`,
  );
  // Bật RAG nếu có cấu hình Qdrant: index lúc khởi động + định kỳ (không chặn server).
  if (config.qdrantUrl) {
    console.log(`[rag] Bật RAG với Qdrant ${config.qdrantUrl} (model embedding: ${config.embedModel})`);
    indexAll();
    setInterval(indexAll, config.ragReindexMs);
  } else {
    console.log('[rag] RAG tắt (chưa cấu hình QDRANT_URL) — chatbot dùng danh sách top-40 như cũ.');
  }
});
