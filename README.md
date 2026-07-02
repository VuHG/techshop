# TechShop — Website bán đồ công nghệ

Website thương mại điện tử bán sản phẩm công nghệ (laptop, PC, linh kiện, phụ kiện) tích hợp **chatbot AI tư vấn**. Đồ án tốt nghiệp ngành CNTT.

Kiến trúc **Modular Monolith**: một backend Spring Boot, một frontend Next.js và một AI Gateway Node.js, dùng PostgreSQL + Redis.

```
Nginx (reverse proxy)
  ├── Next.js frontend     :3000
  ├── Spring Boot backend  :8080
  └── Node.js AI gateway   :3001
          ↓            ↓
      PostgreSQL 16   Redis 7   →  Google Gemini API
```

---

## 1. Yêu cầu môi trường

Cài sẵn các phần mềm sau trước khi bắt đầu:

| Công cụ | Phiên bản | Ghi chú |
|---|---|---|
| **JDK** | 21 | Cho backend Spring Boot |
| **Maven** | 3.9+ | Build backend (có thể dùng `mvnw` kèm theo) |
| **Node.js** | >= 20 | Cho frontend & AI gateway |
| **PostgreSQL** | 16 | Cơ sở dữ liệu chính |
| **Redis** | 7 | Cache & session |
| **Git** | mới nhất | |

> AI Gateway dùng **Google Gemini** (free tier). Lấy API key tại https://aistudio.google.com/app/apikey

---

## 2. Lấy mã nguồn

```bash
git clone https://github.com/VuHG/techshop.git
cd techshop
```

---

## 3. Chuẩn bị cơ sở dữ liệu (PostgreSQL + Redis)

### 3.1. Tạo database & user PostgreSQL

```sql
CREATE DATABASE techshop;
CREATE USER techshop WITH PASSWORD 'techshop_dev_2026';
GRANT ALL PRIVILEGES ON DATABASE techshop TO techshop;
```

> Đây là thông tin kết nối mặc định trong [backend/src/main/resources/application.yml](backend/src/main/resources/application.yml). Nếu bạn dùng user/mật khẩu khác, hãy đặt qua biến môi trường `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.

Bảng được tạo **tự động bằng Flyway** khi backend khởi động (migration nằm ở [db/migrations](db/migrations) và `backend/src/main/resources/db/migration`). **Không** cần chạy SQL thủ công.

### 3.2. Chạy Redis

Đảm bảo Redis đang chạy ở `localhost:6379` (mặc định).

---

## 4. Cấu hình & chạy Backend (Spring Boot — cổng 8080)

```bash
cd backend
```

Các biến môi trường quan trọng (đều có giá trị mặc định cho dev, xem `application.yml`):

| Biến | Mặc định | Mô tả |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/techshop` | Chuỗi kết nối DB |
| `DB_USERNAME` | `techshop` | User DB |
| `DB_PASSWORD` | `techshop_dev_2026` | Mật khẩu DB |
| `REDIS_HOST` / `REDIS_PORT` | `localhost` / `6379` | Redis |
| `JWT_SECRET` | (giá trị dev sẵn) | **Đổi ở production** |
| `MAIL_DEV_MODE` | `false` | `true` = in OTP ra console, không gửi email thật |
| `MAIL_PASSWORD` | (rỗng) | API key SendGrid (để gửi email OTP) |
| `ADMIN_PHONE` / `ADMIN_PASSWORD` | `0999999999` / `Admin@123` | Tài khoản admin mặc định |

> **Mẹo dev:** đặt `MAIL_DEV_MODE=true` để xem mã OTP trong log console mà không cần cấu hình email.

Chạy:

```bash
# Cài dependency & build
mvn clean install

# Chạy dev server
mvn spring-boot:run
```

Backend chạy tại http://localhost:8080/api. Lần chạy đầu Flyway sẽ tạo toàn bộ bảng và `AdminSeeder` tạo tài khoản admin mặc định.

---

## 5. Cấu hình & chạy AI Gateway (Node.js — cổng 3001)

```bash
cd ai-gateway
cp .env.example .env      # Windows PowerShell: copy .env.example .env
```

Mở `.env` và điền **`GEMINI_API_KEY`** (bắt buộc):

```env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
CORS_ORIGINS=http://localhost:3000
AI_TIMEOUT_MS=15000
```

Chạy:

```bash
npm install
npm run dev      # hoặc: npm start
```

---

## 6. Cấu hình & chạy Frontend (Next.js — cổng 3000)

```bash
cd frontend
cp .env.example .env.local   # Windows PowerShell: copy .env.example .env.local
```

Nội dung `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_AI_URL=http://localhost:3001/api/ai
```

Chạy:

```bash
npm install
npm run dev
```

Frontend chạy tại http://localhost:3000.

---

## 7. Thứ tự khởi động (tóm tắt)

1. PostgreSQL + Redis (đảm bảo đang chạy)
2. **Backend** → `cd backend && mvn spring-boot:run` (cổng 8080)
3. **AI Gateway** → `cd ai-gateway && npm run dev` (cổng 3001)
4. **Frontend** → `cd frontend && npm run dev` (cổng 3000)

Mở trình duyệt: **http://localhost:3000**

Đăng nhập admin mặc định: SĐT `0999999999` / mật khẩu `Admin@123`.

---

## ⚡ Chạy nhanh toàn bộ bằng Docker (khuyến nghị)

Thay vì cài JDK/Node/Postgres/Redis riêng, có thể chạy **tất cả** bằng Docker:

```bash
cp .env.example .env          # điền GEMINI_API_KEY; đổi IP trong NEXT_PUBLIC_*/CORS_ORIGINS nếu deploy LAN/VPS
docker compose up -d --build
```

Compose dựng 6 dịch vụ: **postgres, redis, qdrant, backend, ai-gateway, frontend**
(cổng 5432 · 6379 · 6333 · 8080 · 3001 · 3000). Flyway tự tạo bảng + seed khi backend khởi động;
ai-gateway tự index sản phẩm vào Qdrant (RAG) cho chatbot.

- Mở web: http://localhost:3000 (hoặc `http://<IP-server>:3000`)
- Xem log: `docker compose logs -f backend` · Dừng: `docker compose down` · Xóa cả dữ liệu: `docker compose down -v`

> ⚠️ Nếu đang chạy Postgres/Redis/Qdrant thủ công thì **tắt** chúng trước (tránh trùng cổng).
> ⚠️ `NEXT_PUBLIC_*` được nướng vào lúc **build** frontend → đổi IP xong phải build lại: `docker compose build frontend`.

### CI/CD với Jenkins
[Jenkinsfile](Jenkinsfile) định nghĩa pipeline: **Checkout → Build image → Deploy (`docker compose up -d`) → Smoke test**.
Tạo Pipeline job trỏ vào repo; agent cần có Docker + docker compose (v2) + `curl` và file `.env` ở workspace.

---

## 8. Lệnh thường dùng

**Backend:**
```bash
mvn clean install            # Build
mvn spring-boot:run          # Chạy dev (cổng 8080)
mvn test                     # Chạy toàn bộ test
mvn test -Dtest=ClassName    # Chạy 1 test class
```

**Frontend:**
```bash
npm run dev      # Dev server (cổng 3000)
npm run build    # Build production
npm run lint     # ESLint
```

**AI Gateway:**
```bash
npm run dev      # Dev server (cổng 3001)
npm start        # Chạy production
```

---

## 9. Cấu trúc thư mục

```
.
├── backend/        # Spring Boot 3.3 (Java 21) — API chính
├── frontend/       # Next.js 14 (TypeScript, Tailwind)
├── ai-gateway/     # Node.js + Express — proxy tới Google Gemini
└── db/migrations/  # Tài liệu/script migration cơ sở dữ liệu
```

---

## Tech Stack

**Backend:** Spring Boot 3.3, Java 21, Spring Data JPA + Hibernate, Flyway, Spring Security + JWT, Redis, MapStruct, Lombok
**Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, TanStack Query, React Hook Form + Zod
**AI Gateway:** Node.js 20, Express, Google Gemini (`@google/genai`)
**Hạ tầng:** PostgreSQL 16, Redis 7, Nginx
