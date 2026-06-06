# TECHSHOP - PROJECT BRIEF FOR CLAUDE CODE

> **Đọc kỹ file này trước khi viết bất kỳ dòng code nào.**
> Mọi quyết định technical phải tuân theo các nguyên tắc trong document này.

---

## 1. PROJECT OVERVIEW

**Tên dự án:** TechShop - Nền tảng Thương mại điện tử Công nghệ tích hợp Trợ lý ảo AI

**Mục đích:** Website bán đồ công nghệ (laptop, PC, linh kiện, phụ kiện) với chatbot AI tư vấn cấu hình. Đây là đồ án tốt nghiệp của sinh viên IT năm 4.

**Phạm vi MVP:** Chỉ build phía người dùng (Guest + Customer). Admin panel làm sau.

**Ngôn ngữ code:** Tất cả entity, table, column dùng **tiếng Việt không dấu** (snake_case). Comment, log, message UI dùng **tiếng Việt có dấu**.

---

## 2. HARDWARE CONSTRAINTS

### Môi trường dev local
- Ubuntu trên VMware
- Host: Dell G3 i7 10th, 16GB RAM
- Mục tiêu: chạy mượt cho 1 developer

### Môi trường production
- VPS Ubuntu 22.04
- **3 CPU cores, 2GB RAM, 1GB Swap, 50GB SSD**
- Mục tiêu: chạy ổn định cho 10-30 concurrent users
- Sẵn sàng scale lên hàng nghìn user trong tương lai

**Hậu quả:** Mọi quyết định kỹ thuật phải tính đến RAM 2GB. Không over-engineer.

---

## 3. TECH STACK

### Backend
- **Framework:** Spring Boot 3.3.x
- **Language:** Java 21
- **Build:** Maven
- **ORM:** Spring Data JPA + Hibernate
- **Security:** Spring Security + JWT (jjwt 0.11.5)
- **Migration:** Flyway
- **Cache:** Spring Data Redis
- **Email:** Spring Mail + SendGrid SMTP
- **Validation:** Jakarta Validation
- **Utility:** Lombok, MapStruct

### Database
- **Primary:** PostgreSQL 16
- **Cache:** Redis 7
- **Đặc trưng:** Tận dụng tối đa **JSONB** của PostgreSQL

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand + React Query (TanStack Query v5)
- **Form:** React Hook Form + Zod
- **HTTP:** Axios
- **UI utilities:** lucide-react, swiper, framer-motion, react-hot-toast, date-fns

### AI Gateway
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **LLM Provider:** Groq API (free tier, model `llama-3.1-70b-versatile`)
- **Cache:** Redis (chia sẻ với backend)

### DevOps
- **Container:** Docker + Docker Compose
- **Reverse Proxy:** Nginx
- **SSL:** Let's Encrypt (Certbot)
- **CI/CD:** GitHub Actions
- **Monitoring:** UptimeRobot + Sentry

---

## 4. ARCHITECTURE

### Pattern: Modular Monolith ("Lite Microservices")

**KHÔNG dùng microservices thật** (không đủ RAM). Code Spring Boot 1 JAR duy nhất, nhưng tổ chức code theo module rõ ràng để có thể tách microservice sau này.

```
HTTP/HTTPS
    ↓
Nginx (Reverse Proxy + SSL + Rate Limit)
    ↓
┌──────────────┬──────────────┬─────────────┐
│  Next.js     │  Spring Boot │  Node.js    │
│  Frontend    │  Backend     │  AI Gateway │
│  :3000       │  :8080       │  :3001      │
└──────────────┴──────────────┴─────────────┘
        ↓              ↓              ↓
    PostgreSQL     Redis        Groq API
```

### Module structure (Backend)

```
com.techshop/
├── TechshopApplication.java
├── module/
│   ├── auth/          # Đăng ký, đăng nhập, OTP, JWT
│   ├── product/       # Sản phẩm, biến thể, danh mục, filter
│   ├── cart/          # Giỏ hàng
│   ├── order/         # Đơn hàng, checkout, timeline
│   ├── discount/      # Mã giảm giá
│   ├── review/        # Đánh giá sản phẩm
│   ├── notification/  # Thông báo
│   └── profile/       # Thông tin cá nhân + địa chỉ
└── shared/
    ├── security/      # JWT filter, SecurityConfig
    ├── exception/     # ErrorCode, GlobalExceptionHandler
    ├── response/      # ApiResponse<T> wrapper
    ├── config/        # Redis, Mail, Async config
    └── util/          # Helpers
```

### Module boundary rules

1. **Module không import Entity của module khác.** Giao tiếp qua Interface + DTO.
2. **Controller chỉ gọi Service cùng module.**
3. **Cross-module call qua Service interface** (ví dụ: `OrderService` gọi `ProductQueryService`).
4. **DTO không phải Entity** - luôn map sang DTO trước khi trả về.

---

## 5. DESIGN PHILOSOPHY

### Nguyên tắc cốt lõi

**1. Database không tính toán phức tạp**
- Mọi business logic (tính tổng tiền, áp voucher, calc shipping) làm trên Java
- DB chỉ làm 2 việc: lưu data + lấy data nhanh
- TUYỆT ĐỐI tránh JOIN nhiều bảng và full table scan

**2. Snapshot là tối thượng**
- Order lưu cứng `gia_luc_mua`, `ten_san_pham`, `thong_so_bien_the`, `duong_dan_anh_chinh`
- Không bao giờ JOIN lại bảng Product/Discount để tính lịch sử
- Admin đổi giá 5 năm sau → đơn hàng cũ vẫn nguyên vẹn

**3. Read-cache trong DB**
- `san_pham.diem_danh_gia_tb`, `so_luot_danh_gia`, `so_luot_ban` là CACHE
- `bien_the_san_pham.so_luong_ton` là CACHE (computed from phieu_nhap - don_hang)
- Update cache khi có sự kiện thay đổi, không recompute từ history

**4. JSONB là vũ khí**
- `san_pham.thong_so_ky_thuat` (JSONB) - specs chung mọi variant
- `bien_the_san_pham.thong_so_bien_the` (JSONB) - {"ram":"16GB","color":"Đen"}
- `chi_tiet_thuoc_tinh_loc.thong_so_loc` (JSONB) - filter schema pre-computed
- **GIN index trên JSONB columns** sẽ query nhiều

**5. Atomic SQL cho concurrency**
- Voucher used count: `UPDATE ma_giam_gia SET so_luong_da_dung = so_luong_da_dung + 1 WHERE id = ? AND so_luong_da_dung < so_luong_toi_da`
- Stock decrement: `UPDATE bien_the_san_pham SET so_luong_ton = so_luong_ton - ? WHERE id = ? AND so_luong_ton >= ?`
- Không dùng distributed lock

**6. Async cho side effects**
- Gửi email, gửi notification → @Async, không block main thread
- Khi async fail → log error, không throw exception

---

## 6. DATABASE SCHEMA

### Triết lý: Parent-Child Product Model

```
san_pham (parent)
  - KHÔNG có giá, KHÔNG có stock, KHÔNG có ảnh
  - Chỉ có: tên, mô tả, thong_so_ky_thuat (JSONB chung)
  
bien_the_san_pham (child)
  - CÓ giá_niem_yet, giá_bán, stock, SKU
  - CÓ thong_so_bien_the (JSONB: {"ram":"16GB"})
  - Ảnh gắn vào bien_the (đổi variant → đổi gallery)
```

### Danh sách 26 bảng

**Nhóm 1: Bảo mật & Người dùng**
- `vai_tro` - Roles (CUSTOMER, ADMIN)
- `nguoi_dung` - Users
- `mat_khau_reset` - OTP tokens cho quên mật khẩu
- `dia_chi` - Sổ địa chỉ (cascade tỉnh/huyện/xã)

**Nhóm 2: Danh mục & Phân loại**
- `danh_muc` - Categories (self-ref cha-con)
- `phan_loai_san_pham` - Product types (Laptop, PC, RAM PC...)
- `chi_tiet_thuoc_tinh_loc` - Filter schema JSONB pre-computed

**Nhóm 3: Từ điển thuộc tính**
- `thuoc_tinh` - Attributes (RAM, CPU, Màu)
- `gia_tri_thuoc_tinh` - Values (16GB, 32GB, Đen)

**Nhóm 4: Nhãn**
- `nhan_san_pham` - Tags (Hot, Sale, Trả góp 0%)

**Nhóm 5: Sản phẩm & Biến thể**
- `san_pham` - Products (parent)
- `bien_the_san_pham` - Variants (child)
- `bien_the_gia_tri_thuoc_tinh` - Pivot variant ↔ attribute value
- `bien_the_nhan` - Pivot variant ↔ tag
- `anh_san_pham` - Images (gắn vào variant)

**Nhóm 6: Giỏ hàng**
- `gio_hang` - Cart items (1 bảng, không có wrapper)

**Nhóm 7: Đơn hàng**
- `don_hang` - Orders với snapshot data
- `chi_tiet_don_hang` - Order items với snapshot
- `lich_su_trang_thai_don_hang` - Timeline

**Nhóm 8: Đánh giá**
- `danh_gia` - Reviews
- `danh_gia_media` - Ảnh/video review (MVP có thể bỏ)

**Nhóm 9: Thông báo**
- `thong_bao` - Notifications

**Nhóm 10: Mã giảm giá**
- `ma_giam_gia` - Discount codes
- `ma_giam_gia_san_pham` - Pivot code ↔ product
- `lich_su_dung_ma` - Track user đã dùng mã nào

**Nhóm 11: Kho**
- `phieu_nhap` - Stock receipts
- `chi_tiet_phieu_nhap` - Receipt details

### Schema rules

- PK: `id BIGSERIAL` cho tất cả bảng
- Timestamp: `ngay_tao`, `ngay_cap_nhat` với default `now()`
- Soft delete: dùng `trang_thai` enum thay vì xóa cứng
- Status field: dùng VARCHAR với constraint, không dùng ENUM type
- JSONB index: GIN cho mọi cột JSONB sẽ filter
- Foreign key: REQUIRED, không để dangling reference

---

## 7. FEATURE SCOPE (MVP)

### 17 Use Cases phía người dùng

**Nhóm Guest (chưa đăng nhập):**
- UC1: Đăng nhập (bằng **Số điện thoại + mật khẩu**)
- UC2: Đăng ký (Họ tên, SĐT, Email optional, Ngày sinh, Mật khẩu)
- UC3: Quên mật khẩu (OTP **6 chữ số qua Email**, hết hạn 5 phút)
- UC4: Tìm kiếm sản phẩm (auto-suggest sau 600ms)
- UC5: So sánh sản phẩm (2-3 sản phẩm cùng phân loại)
- UC5.1: Chọn sản phẩm muốn so sánh
- UC6: Lọc sản phẩm theo Tag
- UC7: Lọc sản phẩm theo Danh mục
- UC7.1: Lọc chi tiết (filter động theo JSONB schema)
- UC8: Tương tác với Chatbot AI

**Nhóm Customer (đã đăng nhập):**
- UC9: Thêm vào giỏ hàng
- UC10: Mua hàng (chỉ COD cho MVP)
- UC11: Quản lý giỏ hàng (checkbox chọn từng item)
- UC12: Quản lý lịch sử mua hàng (6 tabs trạng thái)
- UC12.1: Xem chi tiết đơn hàng
- UC12.2: Hủy đơn hàng (chỉ khi CHO_DUYET/DA_DUYET)
- UC12.3: Xác nhận đã nhận hàng
- UC13: Đánh giá sản phẩm (chỉ sau khi đơn HOAN_THANH)
- UC14: Quản lý thông tin cá nhân
- UC14.1: Sửa thông tin
- UC14.2: Thêm địa chỉ
- UC14.3: Sửa địa chỉ
- UC14.4: Xóa địa chỉ
- UC15: Xem thông báo
- UC16: Xem lịch sử đánh giá
- UC17: Đăng xuất

### Order Status Flow (6 trạng thái)

```
CHO_THANH_TOAN → CHO_XU_LY → DANG_GIAO → GIAO_THANH_CONG → HOAN_THANH
                     ↓                          ↓
                  DA_HUY                  (Customer xác nhận)
```

Với MVP COD: bỏ qua CHO_THANH_TOAN, vào thẳng CHO_XU_LY.

### Loại trừ khỏi MVP

- Payment gateway (VNPay, Momo, ShopeePay) → COD only
- Google/Zalo social login
- Multi voucher (chỉ 1 mã/đơn)
- Flash sale countdown logic (chỉ UI hiển thị)
- Membership tier ("Thành viên Bạc")
- Lịch sử tư vấn AI (chatbot có session nhưng không lưu DB)
- Upload media trong review (text only)
- Admin panel (làm sau)

---

## 8. API DESIGN STANDARDS

### Base URL
- Local dev: `http://localhost:8080/api`
- Production: `https://techshop.vn/api`

### Authentication
- JWT Bearer token trong header: `Authorization: Bearer <token>`
- Access token: 15 phút
- Refresh token: 7 ngày (HTTP-only cookie hoặc body)

### Response format chuẩn

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-05-21T10:30:00"
}
```

**Error:**
```json
{
  "success": false,
  "errorCode": "PRODUCT_NOT_FOUND",
  "message": "Sản phẩm không tồn tại",
  "timestamp": "2026-05-21T10:30:00"
}
```

### Endpoint conventions

- URL: kebab-case, danh từ số nhiều: `/api/products`, `/api/orders`
- Path param cho ID: `/api/products/:id`
- Query param cho filter/sort/paginate: `?page=1&size=20&sortBy=price_asc`
- POST: tạo mới hoặc action không idempotent
- PUT: update full resource
- PATCH: update partial
- DELETE: xóa (thường soft delete)

### Pagination

```
Query: ?page=0&size=20

Response:
{
  "items": [...],
  "totalElements": 150,
  "totalPages": 8,
  "currentPage": 0,
  "hasNext": true
}
```

### Status codes

- 200: OK
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (chưa login)
- 403: Forbidden (không có quyền)
- 404: Not Found
- 409: Conflict (duplicate)
- 422: Unprocessable (business rule violation)
- 500: Internal Server Error

### Error codes (tham khảo)

```
AUTH_001: Email đã được sử dụng
AUTH_002: Email hoặc mật khẩu không đúng
AUTH_003: Tài khoản đang bị khóa
AUTH_004: OTP hết hạn hoặc không đúng
AUTH_005: Token không hợp lệ
AUTH_006: Token đã hết hạn

PROD_001: Sản phẩm không tồn tại
PROD_002: Biến thể đã hết hàng
PROD_003: Không thể so sánh sản phẩm khác phân loại

CART_001: Giỏ hàng trống
CART_002: Số lượng vượt quá tồn kho

ORD_001: Đơn hàng không tồn tại
ORD_002: Không thể hủy đơn ở trạng thái này
ORD_003: Bạn không có quyền xem đơn hàng này

DIS_001: Mã giảm giá không tồn tại
DIS_002: Mã giảm giá đã hết hạn
DIS_003: Mã giảm giá đã hết lượt dùng
DIS_004: Đơn hàng chưa đạt giá trị tối thiểu

REV_001: Chỉ đánh giá được khi đơn hoàn thành
REV_002: Bạn đã đánh giá sản phẩm này
```

---

## 9. SECURITY REQUIREMENTS

### Authentication
- Password hash: BCrypt cost 10
- JWT secret: ít nhất 32 ký tự random
- Refresh token rotation: tạo refresh mới mỗi lần dùng

### Authorization
- Mọi endpoint `/api/auth/*` public
- Mọi endpoint khác mặc định require JWT
- User chỉ xem được data của mình (filter by user_id từ token)

### Rate limiting (Nginx)
- `/api/auth/login`: 5 req/phút/IP
- `/api/auth/*`: 10 req/phút/IP
- `/api/*`: 60 req/phút/IP

### Input validation
- Mọi DTO có `@Valid` annotation
- Validate ở Controller layer trước khi vào Service
- Message validation tiếng Việt

### Headers
- CORS chỉ cho phép origin của frontend
- HTTPS only ở production
- HSTS enabled

---

## 10. CODE STANDARDS

### Java/Spring Boot

```java
// Naming
- Class: PascalCase (NguoiDung, ProductService)
- Method: camelCase (timKiemSanPham)
- Constant: UPPER_SNAKE_CASE
- Package: lowercase

// Lombok usage
@Data           // Cho DTO
@Builder        // Cho DTO/Response
@RequiredArgsConstructor  // Cho Service/Controller
@Slf4j          // Cho logging

// Entity
@Entity
@Table(name = "nguoi_dung")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class NguoiDung {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "ho_ten", nullable = false)
    private String hoTen;
}

// DTO
@Data
@Builder
public class UserResponse {
    private Long id;
    private String hoTen;
    private String email;
}

// Controller
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    private final AuthService authService;
    
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }
}

// Service
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuthService {
    private final NguoiDungRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public AuthResponse login(LoginRequest request) {
        NguoiDung user = userRepository.findBySoDienThoai(request.getSoDienThoai())
            .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));
        // ...
    }
}
```

### TypeScript/Next.js

```typescript
// Naming
- Component: PascalCase (ProductCard, CartDrawer)
- File: PascalCase cho component, kebab-case cho page
- Function: camelCase
- Type/Interface: PascalCase

// Component structure
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (id: number) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onAddToCart?.(product.id);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="rounded-lg border p-4 hover:shadow-lg transition">
      {/* ... */}
    </div>
  );
}

// Service
import { api } from '@/lib/api';

export const productService = {
  list: async (params: ProductFilterParams) => {
    const { data } = await api.get<ApiResponse<PageResponse<Product>>>('/products', { params });
    return data.data;
  },
  
  getBySlug: async (slug: string) => {
    const { data } = await api.get<ApiResponse<ProductDetail>>(`/products/${slug}`);
    return data.data;
  },
};

// Zustand store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      login: (user, token) => set({ user, accessToken: token }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    { name: 'auth-storage' }
  )
);
```

---

## 11. DEVELOPMENT WORKFLOW

### Branch strategy
- `main` - production
- `develop` - integration
- `feature/<name>` - mỗi feature 1 branch
- Merge: PR từ feature → develop → main

### Commit convention (Conventional Commits)
```
feat:     tính năng mới
fix:      sửa bug
docs:     documentation
style:    format, không đổi logic
refactor: refactor code
test:     thêm/sửa test
chore:    config, dependencies
perf:     optimization

Ví dụ:
feat(auth): add forgot password with OTP via email
fix(order): correct total calculation when discount applied
```

### Test khi code
- Backend: dùng Postman/curl test ngay sau mỗi endpoint
- Frontend: test trên browser, check console errors
- Không gom hết rồi test cuối

---

## 12. EXECUTION PHASES (Timeline 12 tuần)

```
Phase 0  (2 ngày)  : Setup môi trường dev
Phase 1  (5 ngày)  : Database schema + seed data
Phase 2  (5 ngày)  : Backend Auth module
Phase 3  (5 ngày)  : Backend Product + Category
Phase 4  (6 ngày)  : Backend Cart + Order + Discount
Phase 5  (4 ngày)  : Backend Profile + Review + Notification
Phase 6  (2 ngày)  : AI Gateway (Node.js)
Phase 7  (4 ngày)  : Frontend setup + Layout
Phase 8  (5 ngày)  : Frontend Auth + Product browsing
Phase 9  (5 ngày)  : Frontend Cart + Checkout + Order
Phase 10 (3 ngày)  : Frontend Review + Notification + Chatbot
Phase 11 (4 ngày)  : Testing + Polish
Phase 12 (4 ngày)  : Deployment to VPS
Phase 13 (2 ngày)  : Monitoring + Demo prep
```

### Mỗi phase phải có

1. **Deliverables rõ ràng** - tick checklist
2. **Commit trên develop branch** - khi xong feature
3. **Test pass** - manual test các luồng chính
4. **Documentation update** - update README/docs nếu cần

---

## 13. CRITICAL DECISIONS (Đã chốt - KHÔNG đổi)

| Vấn đề | Quyết định |
|--------|-----------|
| Đăng nhập bằng | Số điện thoại + mật khẩu |
| Form đăng ký | Họ tên, SĐT, Email (optional), Ngày sinh, Mật khẩu, Xác nhận mật khẩu |
| OTP | 6 chữ số qua **Email** (không SMS), hết hạn 5 phút |
| Tabs lịch sử đơn | 6 tabs: Tất cả, Chờ xử lý, Đang giao, Giao thành công, Hoàn thành, Đã hủy |
| Payment | Chỉ COD cho MVP |
| Voucher | 1 mã/đơn cho MVP |
| Social login | Bỏ khỏi MVP |
| Membership tier | Bỏ khỏi MVP |
| Lịch sử tư vấn AI | Bỏ khỏi MVP, chỉ session-based |
| Upload media review | Bỏ khỏi MVP, text-only |
| Flash sale countdown | UI hiển thị, không có logic phức tạp |

---

## 14. COMMON PITFALLS - TRÁNH NGAY

### Backend
- ❌ `ddl-auto: create` hoặc `update` ở production (luôn dùng Flyway migration)
- ❌ JOIN nhiều bảng để hiển thị product card (đã có cache fields)
- ❌ Tính `avg_rating` bằng AVG() mỗi lần load product (đã cache)
- ❌ Lưu password plain text hoặc MD5/SHA1 (dùng BCrypt)
- ❌ Trả Entity về cho client (luôn map sang DTO)
- ❌ Bắt `Exception` chung chung (dùng AppException + ErrorCode)
- ❌ Log password, token, sensitive data
- ❌ `@Transactional` đặt sai layer (đặt ở Service, không phải Controller)
- ❌ Quên `@Async` cho gửi email/notification (sẽ block response)

### Frontend
- ❌ Fetch data trong component không có loading state
- ❌ Quên catch error trong async function
- ❌ Store nguyên `accessToken` trong Redux/Context không persist
- ❌ Inline style (luôn dùng Tailwind class)
- ❌ Hardcode API URL (dùng `process.env.NEXT_PUBLIC_API_URL`)
- ❌ Dùng `any` type
- ❌ Form không có validation
- ❌ Không có ProtectedRoute cho `/account`, `/checkout`

### Database
- ❌ Quên index trên foreign key và filter columns
- ❌ JSONB không có GIN index khi cần query
- ❌ Dùng `SERIAL` thay vì `BIGSERIAL` (sẽ overflow nếu nhiều record)
- ❌ Lưu giá tiền bằng `FLOAT` (dùng `DECIMAL(15,2)`)
- ❌ DateTime không có timezone (dùng `TIMESTAMP WITH TIME ZONE` hoặc UTC)

---

## 15. PROMPT TEMPLATE FOR CLAUDE CODE

Khi giao việc cho Claude Code, dùng format này:

```markdown
## Context
Tôi đang phát triển TechShop theo brief đã định nghĩa.
Hiện đang ở Phase X, Bước Y.

## Current Task
[Mô tả cụ thể task cần làm]

## Constraints
- Follow Modular Monolith structure
- Code theo standards trong brief
- Tuân thủ design philosophy (snapshot, cache, JSONB)
- Validation tiếng Việt
- Response format ApiResponse<T>

## Input
- ERD schema: [reference]
- Đặc tả UC: [paste hoặc reference]
- File hiện có: [list files đã code]

## Deliverable
[Danh sách file cần tạo/sửa]
- Test cases nếu có
- Cách verify bằng curl/browser
```

---

## 16. QUICK REFERENCE LINKS

### Documentation (đã có)
- ERD schema: `/docs/database/erd.dbml`
- Use case spec: `/docs/specs/usecase-detail.docx`
- UI mockups: `/docs/mockups/*.png`
- API spec: sẽ generate qua Swagger

### External APIs
- Groq: https://console.groq.com (free LLM)
- SendGrid: https://sendgrid.com (free 100 email/day)
- Vietnam administrative data: https://github.com/madnh/hanhchinhvn

---

## 17. SUCCESS CRITERIA

Dự án được coi là thành công khi:

### Technical
- [ ] Website live tại https://techshop.vn với HTTPS
- [ ] Tất cả 17 use cases phía user hoạt động end-to-end
- [ ] AI Chatbot trả lời được trong 15s
- [ ] Database có ít nhất 20 sản phẩm thực, 50+ variants
- [ ] RAM tổng dùng < 1.5GB trên VPS 2GB
- [ ] API response time < 500ms (P95)
- [ ] Frontend Lighthouse score > 80
- [ ] Không có critical security vulnerability
- [ ] Responsive trên mobile

### Process
- [ ] Code có structure rõ ràng theo Modular Monolith
- [ ] Git history clean với commit message theo convention
- [ ] Documentation đầy đủ trong README
- [ ] CI/CD pipeline hoạt động (push main → auto deploy)
- [ ] Database backup automated daily

### Demo (cho hội đồng đồ án)
- [ ] Demo 7 scenarios chính không lỗi
- [ ] Giải thích được architecture decisions
- [ ] Show được performance metrics
- [ ] Trả lời được "tại sao chọn tech này" cho mọi component

---

## 18. PRINCIPLES TO LIVE BY

```
1. SHIP SOMETHING EVERY DAY
   Dù chỉ là 1 commit nhỏ. Progress > Perfection.

2. TEST AS YOU GO
   Không gom bug, fix ngay khi phát hiện.

3. ASK WHEN STUCK
   Không tự đoán. Hỏi với context đầy đủ.

4. DON'T OVER-ENGINEER
   MVP trước, optimize sau. YAGNI.

5. DOCUMENT DECISIONS
   Tại sao chọn cái này thay vì cái kia → ghi lại.

6. RESPECT THE CONSTRAINTS
   VPS chỉ 2GB RAM. Mỗi MB tiết kiệm là một quyết định đúng.

7. JSONB IS YOUR FRIEND
   Khi schema linh hoạt, dùng JSONB. Khi cần query mạnh, dùng GIN index.

8. SNAPSHOT EVERYTHING THAT MATTERS
   Order, Payment, Review - những gì liên quan tiền và lịch sử phải snapshot.
```

---

**END OF BRIEF**

> Khi đọc xong file này, bạn (Claude Code) phải hiểu được:
> 1. Đây là dự án gì, scope như thế nào
> 2. Stack công nghệ và lý do chọn
> 3. Kiến trúc Modular Monolith và rules
> 4. Design philosophy với JSONB + Snapshot + Cache
> 5. 26 bảng database và quan hệ
> 6. 17 use cases cần implement
> 7. Standards code Java/TypeScript
> 8. Timeline 12 tuần với 13 phases
> 9. Critical decisions không được đổi
> 10. Pitfalls tuyệt đối tránh
>
> Mỗi lần tôi giao task, bạn phải reference file này để đảm bảo consistency.
