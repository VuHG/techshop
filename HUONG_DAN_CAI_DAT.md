# Hướng dẫn cài đặt & chạy TechShop (dành cho người chấm)

Toàn bộ hệ thống (frontend, backend, AI gateway, PostgreSQL, Redis, Qdrant) được đóng gói bằng
**Docker**. Chỉ cần cài Docker và chạy **một lệnh** — không phải cài Java/Node/Postgres riêng.

---

## 1. Yêu cầu máy

| Cần có | Ghi chú |
|---|---|
| **Docker Desktop** (Windows/macOS) hoặc **Docker + Docker Compose** (Linux) | https://www.docker.com/products/docker-desktop |
| **Kết nối Internet** | Lần đầu tải thư viện + gọi Google Gemini cho chatbot |
| **Trống các cổng** 3000, 8080, 3001, 5432, 6379, 6333 | Nếu đang bận, tắt ứng dụng chiếm cổng |

---

## 2. Lấy mã nguồn

```bash
git clone <ĐƯỜNG_DẪN_REPO> techshop
cd techshop
```
(Hoặc giải nén file zip mã nguồn rồi `cd` vào thư mục dự án.)

---

## 3. Tạo file cấu hình `.env`

```bash
cp .env.example .env      # Windows PowerShell: copy .env.example .env
```
Mở `.env`, chỉ cần điền **GEMINI_API_KEY** (bắt buộc cho chatbot AI):
```env
GEMINI_API_KEY=<API key Google Gemini>
```
> Lấy key miễn phí tại https://aistudio.google.com/app/apikey (hoặc dùng key do sinh viên cung cấp).
> Các dòng còn lại **giữ nguyên** `localhost` khi chạy & xem web ngay trên máy này.

---

## 4. Chạy (một lệnh)

```bash
docker compose up -d --build
```
> Nếu máy dùng Docker Compose bản cũ thì lệnh là: `docker-compose up -d --build`

Lần đầu sẽ mất vài phút (tải thư viện + build). Xong, kiểm tra:
```bash
docker compose ps        # 6 dịch vụ đều phải "Up"
```

---

## 5. Mở website

- Trang khách hàng: **http://localhost:3000**
- Trang quản trị: đăng nhập bằng
  - **Số điện thoại:** `0999999999`
  - **Mật khẩu:** `Admin@123`

Dữ liệu mẫu (danh mục, sản phẩm, giá) được tạo tự động khi khởi động — không cần nhập tay.

---

## 6. Dừng / chạy lại

```bash
docker compose stop          # tạm dừng
docker compose start         # chạy lại
docker compose down          # tắt hẳn (GIỮ dữ liệu)
docker compose up -d         # bật lại
```
> ⚠️ **Không** thêm `-v` vào lệnh `down` — `docker compose down -v` sẽ **xóa toàn bộ dữ liệu**.

---

## 7. Xử lý sự cố thường gặp

| Hiện tượng | Cách khắc phục |
|---|---|
| `bind ... port is already allocated` | Cổng bị chiếm. Tắt app đang dùng cổng đó, hoặc dừng container cũ: `docker ps` rồi `docker stop <tên>` |
| `'compose' is not a docker command` | Dùng bản cũ: gõ `docker-compose ...` (có gạch nối), hoặc cài Docker Compose v2 |
| Chatbot báo lỗi / không trả lời | Chưa điền `GEMINI_API_KEY` đúng trong `.env`. Sửa rồi `docker compose up -d` lại |
| Web mở được nhưng bấm nút không phản hồi | Đang mở từ **máy khác** bằng IP. Xem log: `docker compose logs backend`. Nếu chạy ngay trên máy này thì dùng đúng `http://localhost:3000` |
| Xem log dịch vụ nào đó | `docker compose logs -f backend` (hoặc `frontend`, `ai-gateway`) |

---

## 8. (Tùy chọn) Gửi OTP đăng ký qua email thật

Mặc định OTP **in ra log** để tiện kiểm tra: `docker compose logs backend` (tìm khối `[DEV MODE - EMAIL]`).
Muốn gửi email thật qua Gmail: trong `.env` điền `MAIL_USERNAME`, `MAIL_PASSWORD` (App Password 16 ký tự),
`MAIL_FROM` (= `MAIL_USERNAME`) rồi `docker compose up -d`.

---

## Kiến trúc (tóm tắt)

```
Trình duyệt
  ├── Frontend  Next.js    :3000
  ├── Backend   Spring Boot :8080  ── PostgreSQL :5432 · Redis :6379
  └── AI Gateway Node.js   :3001  ── Qdrant :6333 · Google Gemini
```
