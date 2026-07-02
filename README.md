# TechShop — Website bán đồ công nghệ

Website thương mại điện tử bán sản phẩm công nghệ (laptop, PC, linh kiện, phụ kiện) tích hợp **chatbot AI tư vấn (RAG)** và **hệ thống đề xuất giá / voucher tự động** cho quản trị viên. Đồ án tốt nghiệp ngành CNTT.

Kiến trúc **Modular Monolith**: một backend Spring Boot, một frontend Next.js và một AI Gateway Node.js; dữ liệu dùng PostgreSQL + Redis + Qdrant (vector DB cho tìm kiếm ngữ nghĩa).

```
Trình duyệt (web / mobile)
  ├── Next.js frontend      :3000
  ├── Spring Boot backend   :8080  ──► PostgreSQL 16 · Redis 7
  └── Node.js AI gateway    :3001  ──► Qdrant 6333 · Google Gemini API
```

---

## ⚡ Cách 1 — Chạy nhanh toàn bộ bằng Docker (khuyến nghị)

Không cần cài Java/Node/Postgres riêng — chỉ cần **Docker** và chạy **một lệnh**.

**Yêu cầu:** [Docker Desktop](https://www.docker.com/products/docker-desktop) (Windows/macOS) hoặc Docker + Docker Compose (Linux), Internet, và một **Google Gemini API key** ([lấy miễn phí](https://aistudio.google.com/app/apikey)).

```bash
git clone https://github.com/VuHG/techshop.git
cd techshop
cp .env.example .env          # rồi mở .env điền GEMINI_API_KEY
docker compose up -d --build  # (bản cũ: docker-compose up -d --build)
```

Hoặc **1 cú nháy đúp** bằng script tự động (tự kiểm tra Docker, tạo `.env`, nhắc điền key rồi chạy):
- **Windows:** nháy đúp **`chay.bat`**
- **Linux/macOS:** `bash chay.sh`

Compose dựng **6 dịch vụ**: `postgres · redis · qdrant · backend · ai-gateway · frontend`
(cổng `5432 · 6379 · 6333 · 8080 · 3001 · 3000`). Flyway tự tạo bảng + seed dữ liệu mẫu; ai-gateway tự index sản phẩm vào Qdrant cho chatbot.

- Mở web: **http://localhost:3000** — admin: SĐT `0999999999` / mật khẩu `Admin@123`
- Log: `docker compose logs -f backend` · Dừng: `docker compose down` (giữ dữ liệu) · Xóa cả dữ liệu: `docker compose down -v`

> ⚠️ Truy cập từ máy/điện thoại khác trong LAN: đổi `localhost` → IP server trong `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_AI_URL`, `CORS_ORIGINS` (trong `.env`) rồi `docker compose up -d --build` lại (vì `NEXT_PUBLIC_*` nướng vào lúc build).

📄 Hướng dẫn cài đặt chi tiết cho người chấm: [HUONG_DAN_CAI_DAT.md](HUONG_DAN_CAI_DAT.md)

---

## 🛠️ Cách 2 — Chạy thủ công từng dịch vụ (cho lập trình viên)

**Yêu cầu:** JDK 21, Maven 3.9+, Node.js ≥ 20, PostgreSQL 16, Redis 7, (tùy chọn) Qdrant cho RAG.

### 1) Cơ sở dữ liệu
Tạo DB + user PostgreSQL (khớp mặc định trong [application.yml](backend/src/main/resources/application.yml)):
```sql
CREATE DATABASE techshop;
CREATE USER techshop WITH PASSWORD 'techshop_dev_2026';
GRANT ALL PRIVILEGES ON DATABASE techshop TO techshop;
```
Bảng được tạo **tự động bằng Flyway** khi backend khởi động (migration ở `backend/src/main/resources/db/migration`, V1→V5). Đảm bảo Redis chạy ở `localhost:6379`.

### 2) Backend (cổng 8080)
```bash
cd backend
MAIL_DEV_MODE=true mvn spring-boot:run     # MAIL_DEV_MODE=true: in OTP ra console
```
Lần đầu Flyway tạo bảng + seed; `AdminSeeder` tạo admin mặc định.

### 3) AI Gateway (cổng 3001)
```bash
cd ai-gateway
cp .env.example .env      # điền GEMINI_API_KEY; (tùy chọn) QDRANT_URL để bật RAG
npm install
npm run dev
```

### 4) Frontend (cổng 3000)
```bash
cd frontend
# tạo .env.local:
#   NEXT_PUBLIC_API_URL=http://localhost:8080/api
#   NEXT_PUBLIC_AI_URL=http://localhost:3001/api/ai
npm install
npm run dev
```
Mở **http://localhost:3000**.

---

## Cấu hình biến môi trường (chính)

| Biến | Mặc định | Mô tả |
|---|---|---|
| `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` | `.../techshop`, `techshop`, `techshop_dev_2026` | Kết nối PostgreSQL |
| `REDIS_HOST` / `REDIS_PORT` | `localhost` / `6379` | Redis (cache) |
| `MAIL_DEV_MODE` | `true` (profile dev) | `true` = in OTP ra console; nếu điền Gmail thì **vừa in vừa gửi** |
| `MAIL_USERNAME` / `MAIL_PASSWORD` / `MAIL_FROM` | (rỗng) | Gmail + **App Password 16 ký tự** để gửi OTP thật |
| `ADMIN_PHONE` / `ADMIN_PASSWORD` | `0999999999` / `Admin@123` | Tài khoản admin seed |
| `GEMINI_API_KEY` | (bắt buộc) | Khóa Google Gemini cho chatbot |
| `QDRANT_URL` | `http://qdrant:6333` (Docker) | Để trống = **tắt RAG**, chatbot dùng danh sách top-40 |
| `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_AI_URL` | trỏ backend / ai-gateway | Trình duyệt gọi API (nướng lúc build frontend) |

---

## Tính năng chính

**Khách hàng:** duyệt danh mục / phân loại + lọc theo tiêu chí & khoảng giá, chi tiết sản phẩm nhiều biến thể, giỏ hàng, đặt hàng (COD), mã giảm giá, flash sale, đánh giá sản phẩm, thông báo, đăng ký/đăng nhập + **OTP qua email**, **chatbot AI tư vấn** (RAG tìm ngữ nghĩa toàn kho + hiểu ngân sách).

**Quản trị (admin):** quản lý sản phẩm/biến thể, kho hàng, danh mục nhiều cấp, thuộc tính lọc, đơn hàng, mã giảm giá, người dùng, flash sale, và **"Đề xuất giá & voucher"** — hệ thống tự phân tích (tồn kho, lượt bán, giá thị trường mô phỏng) rồi **đề xuất giá KM / voucher để admin Chấp nhận hoặc Từ chối** (tự hết hạn sau 3 ngày).

**Vận hành:** đóng gói Docker Compose (6 dịch vụ) + pipeline CI/CD [Jenkinsfile](Jenkinsfile) (Checkout → Build image → Deploy → Smoke test) + script chạy 1 chạm.

---

## Cấu trúc thư mục

```
.
├── backend/            # Spring Boot 3.3 (Java 21) — API chính (Modular Monolith)
│   └── src/main/java/com/techshop/module/
│       ├── auth · product · cart · order · discount · review
│       ├── notification · profile · flashsale
│       ├── dexuat/     # Đề xuất giá & voucher (engine + admin duyệt)
│       └── admin · shared
├── frontend/           # Next.js 14 (TypeScript, Tailwind, Zustand, TanStack Query)
├── ai-gateway/         # Node.js + Express — chatbot Gemini + RAG (Qdrant)
├── docker-compose.yml  # Dựng toàn bộ 6 dịch vụ
├── Jenkinsfile         # Pipeline CI/CD
├── chay.bat / chay.sh  # Script chạy 1 chạm
└── HUONG_DAN_CAI_DAT.md
```

---

## Tech Stack

- **Backend:** Spring Boot 3.3, Java 21, Spring Data JPA + Hibernate, Flyway, Spring Security + JWT, Spring Scheduling, Redis, Lombok
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, TanStack Query, React Hook Form + Zod
- **AI Gateway:** Node.js 20, Express, Google Gemini (`@google/genai`), RAG với Qdrant (`@qdrant/js-client-rest`, embedding `gemini-embedding-001`)
- **Hạ tầng:** PostgreSQL 16, Redis 7, Qdrant, Docker Compose, Jenkins CI/CD
