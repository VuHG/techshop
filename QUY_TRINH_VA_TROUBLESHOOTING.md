# 📘 QUY TRÌNH XÂY DỰNG WEBSITE & TROUBLESHOOTING GUIDE

---

# 🎯 PHẦN 1: QUICK REFERENCE - XÁC ĐỊNH PHASE & CÔNG VIỆC

## 📊 BẢNG TÓMT ẮT TẤT CẢ PHASE

| Phase | Tên | Tuần | Mục Đích | Status |
|-------|-----|------|---------|--------|
| **1** | Discovery & Planning | 1-2 | Xác định requirements, design architecture | ⬜ |
| **2** | Database Design | 1-2 | Thiết kế schema, tạo migrations | ⬜ |
| **3** | API Design | 1-2 | Vẽ endpoints, định nghĩa request/response | ⬜ |
| **4** | Backend Dev - Auth | 3-4 | Implement authentication, JWT | ⬜ |
| **5** | Backend Dev - Products | 4-5 | CRUD products, search, filter | ⬜ |
| **6** | Backend Dev - Cart & Orders | 5-6 | Cart, checkout, payment integration | ⬜ |
| **7** | Frontend Setup | 7 | React, Redux, Routing structure | ⬜ |
| **8** | Frontend - Listing & Detail | 7-8 | Product grid, search, product detail | ⬜ |
| **9** | Frontend - Cart & Checkout | 8-9 | Cart page, checkout flow, Stripe form | ⬜ |
| **10** | Frontend - Admin Panel | 9 | Product management, order management | ⬜ |
| **11** | Testing & QA | 10-11 | Unit tests, E2E tests, security audit | ⬜ |
| **12** | Deployment Setup | 12 | Configure Vercel, Railway, DNS, SSL | ⬜ |
| **13** | Launch & Monitoring | 13 | Deploy to production, monitor, fix bugs | ⬜ |

---

## 🏗️ PHASE 1: DISCOVERY & PLANNING (Tuần 1-2)

### Mục Đích
Xác định rõ yêu cầu, không code gì hết, chỉ planning và thiết kế

### Công Việc Chi Tiết

#### **Tuần 1 - Day 1-2: Requirements Analysis**
```
[ ] Trả lời những câu hỏi:
    - Bán sản phẩm gì? (laptop, phone, etc?)
    - Có bao nhiêu sản phẩm? (50? 5000?)
    - Giá bao nhiêu? (budget)
    - Có tính thuế, vận chuyển không?
    - Người mua cần tài khoản hay mua ẩn danh?
    - Cần customize sản phẩm (size, màu) không?
    - Khi user checkout, tự động confirm hay chờ admin?

[ ] Document lại: BRD (Business Requirements Document)
    File: docs/BRD.md
    - Business goals
    - User personas
    - Features (MUST-HAVE, SHOULD-HAVE, NICE-TO-HAVE)
    - Success metrics
    - Timeline
```

#### **Tuần 1 - Day 3-4: Architecture Design**
```
[ ] Vẽ Architecture Diagram:
    User → React SPA → Express Backend → PostgreSQL
                       ↓
                    Redis (cache)
                    Stripe (payment)
                    SendGrid (email)
                    AWS S3 (images)

[ ] Decide tech stack:
    Frontend: React 18 + TypeScript + Vite + Tailwind
    Backend: Express.js + TypeScript + Prisma
    Database: PostgreSQL
    Cache: Redis
    Hosting: Vercel (frontend) + Railway (backend)

[ ] Document: docs/ARCHITECTURE.md
    - Tech stack choices
    - Why each tool?
    - Architecture diagram
    - Data flow
```

#### **Tuần 1 - Day 5: Initial Setup**
```
[ ] Create GitHub repo
    - Branch strategy: main (production), develop (staging)
    - .gitignore setup
    - README.md

[ ] Create project folder structure:
    project-root/
    ├── backend/
    ├── frontend/
    ├── docs/
    │   ├── BRD.md
    │   ├── ARCHITECTURE.md
    │   ├── DATABASE_SCHEMA.md
    │   └── API_SPEC.md
    └── .gitignore

[ ] Commit: "init: Project structure and requirements"
```

#### **Tuần 2 - Day 1-2: Database Schema Design**
```
[ ] Design database schema (bảng nào, cột nào?):
    - Users (id, email, password, name, address)
    - Products (id, name, price, stock, images)
    - Categories (id, name)
    - Orders (id, user_id, total, status)
    - OrderItems (id, order_id, product_id, quantity)
    - Reviews (optional: id, product_id, user_id, rating)

[ ] Create ER diagram (Entity Relationship)
    File: docs/DATABASE_SCHEMA.md

[ ] Define constraints:
    - Foreign keys
    - Unique constraints (email)
    - Not null constraints
    - Indexes for performance
```

#### **Tuần 2 - Day 3-5: API Specification**
```
[ ] Design ALL API endpoints:
    
    Authentication:
    POST   /api/auth/register
    POST   /api/auth/login
    POST   /api/auth/logout
    
    Products:
    GET    /api/products?page=1&limit=20&category=xxx&sort=price
    GET    /api/products/:id
    GET    /api/products/search?q=xxx
    POST   /api/admin/products (admin)
    PUT    /api/admin/products/:id (admin)
    DELETE /api/admin/products/:id (admin)
    
    Cart:
    GET    /api/cart
    POST   /api/cart/items
    PUT    /api/cart/items/:id
    DELETE /api/cart/items/:id
    
    Orders:
    POST   /api/orders/checkout
    GET    /api/orders
    GET    /api/orders/:id
    POST   /api/admin/orders/:id/status (admin)
    
    Payment:
    POST   /api/payment/webhook (Stripe)

[ ] For EACH endpoint, define:
    - HTTP method (GET/POST/PUT/DELETE)
    - URL path
    - Request body (if any)
    - Response format (success + error)
    - Status codes (200, 400, 401, 500, etc)
    - Authentication required? (yes/no)
    - Rate limits?

[ ] Document in: docs/API_SPEC.md
```

### ✅ Deliverables PHASE 1
```
✓ docs/BRD.md (3-5 pages)
✓ docs/ARCHITECTURE.md (2-3 pages)
✓ docs/DATABASE_SCHEMA.md (ER diagram + table definitions)
✓ docs/API_SPEC.md (All endpoints + request/response examples)
✓ GitHub repo ready
✓ Initial commit pushed
```

### ⏰ Time Estimate
- Workdays: 10 days = 2 weeks
- Hours: ~40-50 hours (mostly thinking, not coding)
- Can be done part-time: 4-5 hours/day

### ⚠️ Common Mistakes
```
❌ Bắt đầu code ngay, thiếu planning
❌ Chỉ plan trong đầu, không document
❌ Quên tính edge cases (max stock, expired token, etc)
❌ API design quá phức tạp hoặc không consistent
→ Fix: Đọc lại docs, hỏi Claude review
```

---

## 🗄️ PHASE 2: DATABASE SETUP (Tuần 2-3)

### Mục Đích
Từ design → Implementation. Setup database locally, test connection.

### Công Việc Chi Tiết

#### **Day 1-2: Local Database Setup**
```bash
[ ] Install Docker
    - Download Docker Desktop
    - Test: docker --version

[ ] Create docker-compose.yml
    version: '3.8'
    services:
      postgres:
        image: postgres:16
        environment:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: password
          POSTGRES_DB: tech_store
        ports:
          - "5432:5432"
        volumes:
          - postgres_data:/var/lib/postgresql/data

      redis:
        image: redis:7
        ports:
          - "6379:6379"

    volumes:
      postgres_data:

[ ] Start database:
    docker-compose up -d
    
[ ] Verify connection:
    psql -U postgres -h localhost -d tech_store
    (password: password)
```

#### **Day 3-4: Prisma Setup**
```bash
[ ] Create backend folder & npm project
    mkdir backend
    cd backend
    npm init -y
    npm install @prisma/client
    npm install -D prisma

[ ] Initialize Prisma
    npx prisma init
    
[ ] Configure .env file
    DATABASE_URL="postgresql://postgres:password@localhost:5432/tech_store"
    JWT_SECRET="your_random_secret_here"

[ ] Create Prisma schema
    File: prisma/schema.prisma
    
    generator client {
      provider = "prisma-client-js"
    }

    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }

    model User {
      id    Int     @id @default(autoincrement())
      email String  @unique
      password String
      name  String?
      address String?
      role  String  @default("user")
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
      
      orders Order[]
      reviews Review[]
    }

    model Product {
      id          Int     @id @default(autoincrement())
      name        String
      description String?
      price       Float
      cost        Float?
      stock       Int     @default(0)
      categoryId  Int?
      sku         String? @unique
      images      String[]
      isActive    Boolean @default(true)
      createdAt   DateTime @default(now())
      updatedAt   DateTime @updatedAt
      
      category    Category? @relation(fields: [categoryId], references: [id])
      orderItems  OrderItem[]
      reviews     Review[]
      
      @@index([categoryId])
    }

    model Category {
      id    Int     @id @default(autoincrement())
      name  String  @unique
      slug  String  @unique
      
      products Product[]
    }

    model Order {
      id              Int     @id @default(autoincrement())
      userId          Int
      totalPrice      Float
      status          String  @default("pending") // pending, paid, shipped, delivered, cancelled
      stripePaymentId String?
      shippingAddress String?
      createdAt       DateTime @default(now())
      updatedAt       DateTime @updatedAt
      
      user  User @relation(fields: [userId], references: [id])
      items OrderItem[]
      
      @@index([userId])
      @@index([status])
    }

    model OrderItem {
      id              Int @id @default(autoincrement())
      orderId         Int
      productId       Int
      quantity        Int
      priceAtPurchase Float
      variantJson     Json?
      
      order   Order @relation(fields: [orderId], references: [id])
      product Product @relation(fields: [productId], references: [id])
    }

    model Review {
      id        Int @id @default(autoincrement())
      productId Int
      userId    Int
      rating    Int @default(5)
      comment   String?
      createdAt DateTime @default(now())
      
      product Product @relation(fields: [productId], references: [id])
      user    User @relation(fields: [userId], references: [id])
    }
```

#### **Day 5: Migration & Testing**
```bash
[ ] Create migration
    npx prisma migrate dev --name init
    → Auto-creates migration files + applies to DB

[ ] Generate Prisma Client (types)
    npx prisma generate
    
[ ] Seed test data (optional)
    File: prisma/seed.ts
    
    import { PrismaClient } from '@prisma/client';
    const prisma = new PrismaClient();

    async function main() {
      const category = await prisma.category.create({
        data: { name: 'Laptops', slug: 'laptops' }
      });

      const product = await prisma.product.create({
        data: {
          name: 'MacBook Pro',
          price: 1999,
          stock: 10,
          categoryId: category.id
        }
      });

      console.log({ category, product });
    }

    main()
      .then(() => prisma.$disconnect())
      .catch(() => prisma.$disconnect());

    // Run: npx ts-node prisma/seed.ts

[ ] Test connection
    npx prisma studio
    → Opens UI to view/edit data
```

### ✅ Deliverables PHASE 2
```
✓ docker-compose.yml working
✓ PostgreSQL running locally on port 5432
✓ Prisma schema defined
✓ Database migrations created
✓ Test data seeded (optional)
✓ Can view data in Prisma Studio
```

### ⏰ Time Estimate
- Days: 5 days
- Hours: ~20 hours

---

## 📡 PHASE 3: EXPRESS SERVER SETUP (Tuần 3 Start)

### Mục Đích
Setup Express server, structure folders, connect to database.

### Công Việc Chi Tiết

#### **Day 1-2: Express + TypeScript Setup**
```bash
[ ] Install dependencies
    npm install express
    npm install typescript ts-node @types/express @types/node -D
    npm install dotenv cors helmet

[ ] Create tsconfig.json
    {
      "compilerOptions": {
        "target": "ES2020",
        "module": "commonjs",
        "lib": ["ES2020"],
        "outDir": "./dist",
        "rootDir": "./src",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true
      }
    }

[ ] Folder structure
    backend/
    ├── src/
    │   ├── server.ts (main file)
    │   ├── middleware/
    │   │   ├── auth.ts
    │   │   └── errorHandler.ts
    │   ├── routes/
    │   │   ├── auth.ts
    │   │   ├── products.ts
    │   │   ├── cart.ts
    │   │   └── orders.ts
    │   ├── controllers/
    │   │   ├── authController.ts
    │   │   ├── productController.ts
    │   │   └── orderController.ts
    │   ├── services/
    │   │   ├── authService.ts
    │   │   └── productService.ts
    │   └── utils/
    │       ├── jwt.ts
    │       └── errors.ts
    ├── prisma/
    ├── .env
    └── package.json

[ ] Create src/server.ts
    import express from 'express';
    import dotenv from 'dotenv';
    import cors from 'cors';
    import helmet from 'helmet';
    import { PrismaClient } from '@prisma/client';

    dotenv.config();
    const app = express();
    const prisma = new PrismaClient();

    app.use(cors());
    app.use(helmet());
    app.use(express.json());

    // Routes
    app.get('/api/health', (req, res) => {
      res.json({status: 'OK', timestamp: new Date()});
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

[ ] Create .env
    DATABASE_URL="postgresql://postgres:password@localhost:5432/tech_store"
    JWT_SECRET="your_secret_key_here"
    PORT=3000
    NODE_ENV=development
```

#### **Day 3: Test Server**
```bash
[ ] Update package.json scripts
    "scripts": {
      "dev": "ts-node src/server.ts",
      "build": "tsc",
      "start": "node dist/server.js",
      "prisma:migrate": "prisma migrate dev",
      "prisma:seed": "ts-node prisma/seed.ts"
    }

[ ] Run dev server
    npm run dev
    
[ ] Test endpoint
    curl http://localhost:3000/api/health
    Should return: {status: 'OK', timestamp: '...'}

[ ] Install nodemon (auto-reload on changes)
    npm install -D nodemon
    
    Update package.json:
    "dev": "nodemon --exec ts-node src/server.ts"
```

### ✅ Deliverables PHASE 3
```
✓ Express server running locally
✓ TypeScript configured
✓ Folder structure organized
✓ Can connect to PostgreSQL (test via Prisma)
✓ Nodemon for auto-reload working
```

### ⏰ Time Estimate
- Days: 3 days
- Hours: ~12 hours

---

## 🔐 PHASE 4: AUTHENTICATION (Tuần 3-4)

### Mục Đích
Implement user registration, login, JWT tokens, middleware protection.

### Công Việc Chi Tiết

#### **Day 1-2: Setup Authentication Infrastructure**
```bash
[ ] Install auth dependencies
    npm install jsonwebtoken bcryptjs
    npm install -D @types/jsonwebtoken @types/bcryptjs

[ ] Create utils/jwt.ts
    import jwt from 'jsonwebtoken';

    export const generateAccessToken = (userId: number) => {
      return jwt.sign({userId}, process.env.JWT_SECRET!, {
        expiresIn: '15m'
      });
    };

    export const generateRefreshToken = (userId: number) => {
      return jwt.sign({userId}, process.env.JWT_SECRET!, {
        expiresIn: '7d'
      });
    };

    export const verifyToken = (token: string) => {
      try {
        return jwt.verify(token, process.env.JWT_SECRET!);
      } catch {
        return null;
      }
    };

[ ] Create middleware/auth.ts
    import {Request, Response, NextFunction} from 'express';
    import {verifyToken} from '../utils/jwt';

    export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({error: 'Token required'});

      const decoded = verifyToken(token);
      if (!decoded) return res.status(401).json({error: 'Invalid token'});

      (req as any).userId = (decoded as any).userId;
      next();
    };
```

#### **Day 3-4: Register & Login Endpoints**
```typescript
[ ] Create controllers/authController.ts

export const register = async (req: Request, res: Response) => {
  try {
    const {email, password, name} = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({error: 'Email and password required'});
    }
    
    // Check if user exists
    const existing = await prisma.user.findUnique({where: {email}});
    if (existing) {
      return res.status(400).json({error: 'Email already registered'});
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {email, password: hashedPassword, name}
    });
    
    // Generate token
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    
    res.status(201).json({
      accessToken,
      refreshToken,
      user: {id: user.id, email: user.email, name: user.name}
    });
  } catch (error) {
    res.status(500).json({error: 'Registration failed'});
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const {email, password} = req.body;
    
    if (!email || !password) {
      return res.status(400).json({error: 'Email and password required'});
    }
    
    const user = await prisma.user.findUnique({where: {email}});
    if (!user) {
      return res.status(401).json({error: 'Invalid credentials'});
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({error: 'Invalid credentials'});
    }
    
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    
    res.json({
      accessToken,
      refreshToken,
      user: {id: user.id, email: user.email, name: user.name}
    });
  } catch (error) {
    res.status(500).json({error: 'Login failed'});
  }
};

[ ] Create routes/auth.ts
    import express from 'express';
    import {register, login} from '../controllers/authController';

    const router = express.Router();

    router.post('/register', register);
    router.post('/login', login);

    export default router;

[ ] Add to src/server.ts
    import authRoutes from './routes/auth';
    
    app.use('/api/auth', authRoutes);
```

#### **Day 5: Test Authentication**
```bash
[ ] Test register
    curl -X POST http://localhost:3000/api/auth/register \
      -H "Content-Type: application/json" \
      -d '{"email":"test@example.com","password":"Pass123","name":"Test"}'
    
    Response should have: accessToken, refreshToken, user

[ ] Test login
    curl -X POST http://localhost:3000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"test@example.com","password":"Pass123"}'
    
    Should return tokens

[ ] Test protected endpoint (add later)
    curl -X GET http://localhost:3000/api/protected \
      -H "Authorization: Bearer YOUR_TOKEN"
```

### ✅ Deliverables PHASE 4
```
✓ User registration working
✓ User login working
✓ JWT tokens generated
✓ Auth middleware protecting endpoints
✓ Password hashing with bcrypt
✓ Can test with curl/Postman
```

### ⏰ Time Estimate
- Days: 5 days
- Hours: ~20 hours

---

## 🛍️ PHASE 5: PRODUCTS API (Tuần 4-5)

### Mục Đích
Implement product CRUD, search, filter, pagination.

### Công Việc Chi Tiết

#### **Day 1-3: Product Read Endpoints**
```typescript
[ ] Create controllers/productController.ts

// GET all products with filters
export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    const products = await prisma.product.findMany({
      where: {isActive: true},
      skip,
      take: limit,
      include: {category: true},
      orderBy: {createdAt: 'desc'}
    });
    
    const total = await prisma.product.count({where: {isActive: true}});
    
    res.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({error: 'Failed to fetch products'});
  }
};

// GET product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const product = await prisma.product.findUnique({
      where: {id: parseInt(id)},
      include: {
        category: true,
        reviews: {include: {user: true}}
      }
    });
    
    if (!product) {
      return res.status(404).json({error: 'Product not found'});
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({error: 'Failed to fetch product'});
  }
};

// Search products
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const {q} = req.query;
    if (!q) {
      return res.status(400).json({error: 'Search query required'});
    }
    
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          {name: {contains: q as string, mode: 'insensitive'}},
          {description: {contains: q as string, mode: 'insensitive'}}
        ]
      },
      take: 20
    });
    
    res.json({products});
  } catch (error) {
    res.status(500).json({error: 'Search failed'});
  }
};

[ ] Create routes/products.ts
    import express from 'express';
    import {getProducts, getProductById, searchProducts} from '../controllers/productController';

    const router = express.Router();

    router.get('/', getProducts);
    router.get('/search', searchProducts);
    router.get('/:id', getProductById);

    export default router;

[ ] Add to src/server.ts
    import productRoutes from './routes/products';
    app.use('/api/products', productRoutes);
```

#### **Day 4-5: Admin Product Endpoints**
```typescript
[ ] Add to controllers/productController.ts

// Admin: Create product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const {name, description, price, cost, stock, categoryId, sku, images} = req.body;
    
    // Validate input
    if (!name || !price || stock === undefined) {
      return res.status(400).json({error: 'Missing required fields'});
    }
    
    const product = await prisma.product.create({
      data: {name, description, price, cost, stock, categoryId, sku, images}
    });
    
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({error: 'Failed to create product'});
  }
};

// Admin: Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const {name, description, price, cost, stock, categoryId} = req.body;
    
    const product = await prisma.product.update({
      where: {id: parseInt(id)},
      data: {name, description, price, cost, stock, categoryId}
    });
    
    res.json(product);
  } catch (error) {
    res.status(500).json({error: 'Failed to update product'});
  }
};

// Admin: Delete product (soft delete)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    
    const product = await prisma.product.update({
      where: {id: parseInt(id)},
      data: {isActive: false}
    });
    
    res.json({success: true});
  } catch (error) {
    res.status(500).json({error: 'Failed to delete product'});
  }
};

[ ] Create middleware/admin.ts (check if user is admin)
    export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = (req as any).userId;
        const user = await prisma.user.findUnique({where: {id: userId}});
        
        if (user?.role !== 'admin') {
          return res.status(403).json({error: 'Admin access required'});
        }
        
        next();
      } catch (error) {
        res.status(500).json({error: 'Admin check failed'});
      }
    };

[ ] Update routes/products.ts
    router.post('/', authMiddleware, adminMiddleware, createProduct);
    router.put('/:id', authMiddleware, adminMiddleware, updateProduct);
    router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);
```

### ✅ Deliverables PHASE 5
```
✓ GET /api/products (with pagination)
✓ GET /api/products/:id (with reviews)
✓ GET /api/products/search
✓ POST /api/products (admin)
✓ PUT /api/products/:id (admin)
✓ DELETE /api/products/:id (admin)
✓ Can test all with curl/Postman
```

### ⏰ Time Estimate
- Days: 5 days
- Hours: ~20 hours

---

## 🛒 PHASE 6: CART & ORDERS (Tuần 5-6)

### Mục Đích
Implement shopping cart, checkout, payment integration, order management.

### Công Việc Chi Tiết

#### **Day 1-2: Cart Endpoints (lưu trong Redis)**
```typescript
[ ] Install Redis client
    npm install redis
    npm install -D @types/redis

[ ] Create utils/redis.ts
    import {createClient} from 'redis';

    const redis = createClient({
      host: 'localhost',
      port: 6379
    });

    redis.connect();
    export default redis;

[ ] Create controllers/cartController.ts
    import redis from '../utils/redis';

    // GET cart
    export const getCart = async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const cartData = await redis.get(`cart:${userId}`);
        
        if (!cartData) {
          return res.json({items: [], total: 0});
        }
        
        const items = JSON.parse(cartData);
        
        // Fetch product details for each item
        const enriched = await Promise.all(
          items.map(async (item: any) => {
            const product = await prisma.product.findUnique({
              where: {id: item.productId}
            });
            return {
              ...item,
              productName: product?.name,
              productPrice: product?.price
            };
          })
        );
        
        const total = enriched.reduce((sum, item) => 
          sum + (item.productPrice * item.quantity), 0
        );
        
        res.json({items: enriched, total});
      } catch (error) {
        res.status(500).json({error: 'Failed to fetch cart'});
      }
    };

    // ADD to cart
    export const addToCart = async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const {productId, quantity} = req.body;
        
        // Validate stock
        const product = await prisma.product.findUnique({
          where: {id: productId}
        });
        
        if (!product || product.stock < quantity) {
          return res.status(400).json({error: 'Not enough stock'});
        }
        
        // Get current cart
        const cartData = await redis.get(`cart:${userId}`);
        let items = cartData ? JSON.parse(cartData) : [];
        
        // Add or update item
        const existingIndex = items.findIndex((i: any) => i.productId === productId);
        if (existingIndex >= 0) {
          items[existingIndex].quantity += quantity;
        } else {
          items.push({productId, quantity});
        }
        
        // Save back to Redis
        await redis.set(`cart:${userId}`, JSON.stringify(items), {EX: 86400 * 7});
        
        res.json({success: true, items});
      } catch (error) {
        res.status(500).json({error: 'Failed to add to cart'});
      }
    };

    // REMOVE from cart
    export const removeFromCart = async (req: Request, res: Response) => {
      try {
        const userId = (req as any).userId;
        const {productId} = req.body;
        
        const cartData = await redis.get(`cart:${userId}`);
        let items = cartData ? JSON.parse(cartData) : [];
        
        items = items.filter((i: any) => i.productId !== productId);
        
        await redis.set(`cart:${userId}`, JSON.stringify(items), {EX: 86400 * 7});
        
        res.json({success: true, items});
      } catch (error) {
        res.status(500).json({error: 'Failed to remove from cart'});
      }
    };

[ ] Create routes/cart.ts
    router.get('/', authMiddleware, getCart);
    router.post('/items', authMiddleware, addToCart);
    router.delete('/items', authMiddleware, removeFromCart);
```

#### **Day 3-4: Order & Checkout**
```typescript
[ ] Create controllers/orderController.ts

export const checkout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const {shippingAddress} = req.body;
    
    // Get cart
    const cartData = await redis.get(`cart:${userId}`);
    if (!cartData) {
      return res.status(400).json({error: 'Cart is empty'});
    }
    
    const items = JSON.parse(cartData);
    
    // Calculate total
    let total = 0;
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: {id: item.productId}
      });
      total += product!.price * item.quantity;
    }
    
    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        totalPrice: total,
        shippingAddress,
        status: 'pending',
        items: {
          createMany: {
            data: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.productPrice || 0
            }))
          }
        }
      },
      include: {items: true}
    });
    
    // TODO: Create Stripe payment intent
    
    res.status(201).json({order, clientSecret: '...'});
  } catch (error) {
    res.status(500).json({error: 'Checkout failed'});
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    const orders = await prisma.order.findMany({
      where: {userId},
      include: {items: {include: {product: true}}}
    });
    
    res.json({orders});
  } catch (error) {
    res.status(500).json({error: 'Failed to fetch orders'});
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;
    const userId = (req as any).userId;
    
    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        userId
      },
      include: {items: {include: {product: true}}}
    });
    
    if (!order) {
      return res.status(404).json({error: 'Order not found'});
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({error: 'Failed to fetch order'});
  }
};
```

#### **Day 5: Stripe Integration (Basic)**
```bash
[ ] Install Stripe
    npm install stripe
    npm install -D @types/stripe

[ ] Get Stripe test keys from stripe.com
    Add to .env:
    STRIPE_SECRET_KEY=sk_test_...
    STRIPE_PUBLISHABLE_KEY=pk_test_...

[ ] Add to controllers/orderController.ts
    import Stripe from 'stripe';
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // In checkout function:
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // cents
      currency: 'usd',
      metadata: {orderId: order.id}
    });
    
    res.status(201).json({
      order,
      clientSecret: paymentIntent.client_secret
    });

[ ] Create route for payment webhook (later)
    POST /api/payment/webhook
```

### ✅ Deliverables PHASE 6
```
✓ GET /api/cart
✓ POST /api/cart/items (add to cart)
✓ DELETE /api/cart/items (remove)
✓ POST /api/orders/checkout
✓ GET /api/orders (user's orders)
✓ GET /api/orders/:id
✓ Stripe payment intent created
✓ Test with Postman
```

### ⏰ Time Estimate
- Days: 5 days
- Hours: ~20 hours

---

## ✅ SUMMARY PHASE 1-6

**At this point:**
- Backend fully functional
- All APIs working
- Database designed well
- Can test with Postman

**Next:**
- Frontend development
- Connect frontend to backend
- Testing & deployment

---

# 🎯 PHẦN 2: TROUBLESHOOTING - GIẢI QUYẾT VẤNĐỀ

## 🔍 CÁC TÌNH HUỐNG THƯỜNG GẶP & CÁCH XỬ LÝ

---

## ⚠️ SCENARIO 1: Đang Code PHASE 4 (Auth), Nhận Ra PHASE 1 Thiếu Features

### Tình Huống
```
Bạn đang code: POST /api/auth/login

Rồi nhận ra: "Tôi quên xác định:
- User có cần confirm email trước khi login không?
- Có rate limiting trên login (tránh brute force) không?
- Cần remember me (stay logged in) không?
- Cần 2FA (two-factor auth) không?"

PHASE 1 chưa xác định rõ ràng
→ Không biết implement thế nào
```

### Cách Xử Lý

**Bước 1: Dừng lại, không code thêm**
```
Đừng tiếp tục code login endpoint
Vì requirements không rõ
```

**Bước 2: Cập nhật PHASE 1**
```
File: docs/BRD.md

Thêm vào MUST-HAVE hoặc SHOULD-HAVE:
- Email confirmation: NO (MVP không cần)
- Rate limiting: YES (tối 5 lần login/5 phút)
- Remember me: NO (MVP không cần)
- 2FA: NO (v2.0)
```

**Bước 3: Update API Design**
```
File: docs/API_SPEC.md

POST /api/auth/login
Request: {
  email: string,
  password: string,
  rememberMe?: boolean (NO - remove)
}
Response: {
  accessToken: string,
  refreshToken: string,
  user: {...}
}

Rate Limit: 5 requests per 5 minutes per IP
Response 429 if exceeded: {error: 'Too many login attempts, try again in 5 minutes'}
```

**Bước 4: Update PHASE 3 (Database)**
```
File: docs/DATABASE_SCHEMA.md

Do we need to track failed login attempts?
NO - MVP doesn't need

Do we need email_verified field?
NO - All emails trusted in MVP
```

**Bước 5: Code với requirements rõ ràng**
```typescript
// Now you know exactly what to implement
export const login = async (req: Request, res: Response) => {
  try {
    const {email, password} = req.body;
    
    // Rate limiting
    const attempts = await redis.incr(`login:${req.ip}`);
    if (attempts > 5) {
      return res.status(429).json({error: 'Too many attempts'});
    }
    await redis.expire(`login:${req.ip}`, 300); // 5 minutes
    
    // Validate user
    const user = await prisma.user.findUnique({where: {email}});
    if (!user) {
      return res.status(401).json({error: 'Invalid credentials'});
    }
    
    // Validate password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({error: 'Invalid credentials'});
    }
    
    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    
    res.json({accessToken, refreshToken, user});
  } catch (error) {
    res.status(500).json({error: 'Login failed'});
  }
};
```

**⏰ Effort:**
- Update docs: 30 min
- Code: 1-2 hours
- Test: 30 min
- **Total: ~2.5 hours**

---

## ⚠️ SCENARIO 2: Đang Code PHASE 5 (Products), Nhận Ra PHASE 3 Database Sai

### Tình Huống
```
Bạn code: GET /api/products?category=laptop&sort=price

Khi query database:
const products = await prisma.product.findMany({
  where: {categoryId: 1},
  orderBy: {price: 'asc'}
});

Response time: 800ms (quá chậm!)

Bạn nhận ra: Database không có index trên categoryId
→ Query chạy N+1 problem, không efficient
```

### Cách Xử Lý

**Bước 1: Xác định vấn đề**
```
Analysis:
- Without index: table scan (check all rows)
- With 10,000 products, mỗi query phải scan 10,000 rows
- Response time: 800ms (unacceptable, target < 100ms)

Solution: Add index on categoryId
```

**Bước 2: Update Prisma Schema**
```prisma
model Product {
  ...
  categoryId  Int?
  ...
  @@index([categoryId])  // ← ADD THIS
}
```

**Bước 3: Create Migration**
```bash
npx prisma migrate dev --name add_index_category
```

**Bước 4: Verify Migration**
```sql
-- Check if index was created
SELECT * FROM pg_indexes WHERE tablename = 'Product';
-- Should see: idx_Product_categoryId
```

**Bước 5: Test Performance**
```bash
# Before index: 800ms
# After index: 10-20ms
# ✅ 40x faster!
```

**⏰ Effort:**
- Add index: 5 min
- Migration: 5 min
- Verify: 10 min
- **Total: ~20 min**

---

## ⚠️ SCENARIO 3: PHASE 5 Done, PHASE 6 Discover API Missing Pagination

### Tình Huống
```
Bạn code: POST /api/orders/checkout

Lúc checkout, phải fetch cart từ Redis:
const cartData = await redis.get(`cart:${userId}`);
const items = JSON.parse(cartData); // có thể 1000 items!

Sau đó tạo OrderItems cho mỗi item
→ Nếu user có 1000 items, tạo 1000 rows
→ Query quá lâu

PHASE 5 API design không define max cart size
```

### Cách Xử Lý

**Bước 1: Xác định vấn đề**
```
Issue: No limit on cart size
Scenario: User adds 1000 items to cart
Impact: Checkout takes 30 seconds

Solution: Add max cart limit
```

**Bước 2: Update PHASE 1 (Requirements)**
```
File: docs/BRD.md

Add constraint:
- Max items per cart: 100
- If user tries to add more: error "Cart limit exceeded"
```

**Bước 3: Update PHASE 5 (API)**
```
File: docs/API_SPEC.md

POST /api/cart/items
Rate limit per user: Max 100 items
Response 400 if exceeded: {error: 'Cart limit exceeded'}
```

**Bước 4: Update Code**
```typescript
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const {productId, quantity} = req.body;
    
    // Get current cart
    const cartData = await redis.get(`cart:${userId}`);
    let items = cartData ? JSON.parse(cartData) : [];
    
    // Check limit
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems + quantity > 100) {
      return res.status(400).json({error: 'Cart limit exceeded (max 100 items)'});
    }
    
    // Add to cart
    ...
  }
};
```

**Bước 5: Update PHASE 6 (Checkout)**
```typescript
// Checkout now handles max 100 items efficiently
export const checkout = async (req: Request, res: Response) => {
  // Maximum 100 items, so query is fast
  // Create OrderItems batch
  const items = JSON.parse(cartData);
  
  // Prisma batch create is efficient
  const order = await prisma.order.create({
    data: {
      userId,
      totalPrice: total,
      shippingAddress,
      items: {
        createMany: {
          data: items.map(item => ({...}))
        }
      }
    }
  });
};
```

**⏰ Effort:**
- Update docs: 15 min
- Update code: 30 min
- Test: 15 min
- **Total: ~1 hour**

---

## ⚠️ SCENARIO 4: Shipped Code, User Reports Bug in PHASE 4 (Auth)

### Tình Huống
```
Website LIVE trên production

User report: "Password reset link doesn't work"

Your code:
POST /api/auth/forgot-password
Body: {email}
Response: {message: 'Check your email'}

→ Nhưng bạn không implement password reset link!
PHASE 4 incomplete, forgot design cho reset flow
```

### Cách Xử Lý

**Bước 1: Xác định vấn đề**
```
Issue: Password reset not implemented
Severity: High (users can't recover accounts)
Timeline: Fix ASAP
```

**Bước 2: Quick Fix (Temporary)**
```typescript
// Block this endpoint temporarily
export const forgotPassword = async (req: Request, res: Response) => {
  return res.status(501).json({error: 'Feature coming soon'});
};
```

**Push to production, users see clear message instead of broken feature**

**Bước 3: Plan Proper Fix**
```
Design password reset flow:
1. User submits email
2. Generate reset token (short-lived, 30 min)
3. Send email with reset link
4. User clicks link, goes to frontend
5. Frontend shows password reset form
6. User submits new password
7. Backend validates token, updates password
```

**Bước 4: Implement Properly**
```typescript
// Step 1: Generate reset token
export const forgotPassword = async (req: Request, res: Response) => {
  const {email} = req.body;
  
  const user = await prisma.user.findUnique({where: {email}});
  if (!user) {
    // Don't reveal if email exists
    return res.json({message: 'Check your email if account exists'});
  }
  
  // Generate reset token (valid 30 min)
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = await bcrypt.hash(resetToken, 10);
  
  // Save to database
  await prisma.user.update({
    where: {id: user.id},
    data: {
      resetTokenHash,
      resetTokenExpiry: new Date(Date.now() + 30 * 60 * 1000)
    }
  });
  
  // Send email
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendEmail({
    to: email,
    subject: 'Reset your password',
    html: `Click here to reset: <a href="${resetLink}">${resetLink}</a>`
  });
  
  res.json({message: 'Check your email'});
};

// Step 2: Verify token & reset
export const resetPassword = async (req: Request, res: Response) => {
  const {token, newPassword} = req.body;
  
  const user = await prisma.user.findFirst({
    where: {
      resetTokenExpiry: {gte: new Date()}
    }
  });
  
  if (!user) {
    return res.status(400).json({error: 'Reset token expired'});
  }
  
  // Verify token
  const isValid = await bcrypt.compare(token, user.resetTokenHash!);
  if (!isValid) {
    return res.status(400).json({error: 'Invalid token'});
  }
  
  // Update password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: {id: user.id},
    data: {
      password: hashedPassword,
      resetTokenHash: null,
      resetTokenExpiry: null
    }
  });
  
  res.json({message: 'Password reset successfully'});
};
```

**Bước 5: Update Database**
```prisma
model User {
  ...
  resetTokenHash String?
  resetTokenExpiry DateTime?
}
```

**Bước 6: Create Migration & Deploy**
```bash
npx prisma migrate dev --name add_password_reset
git add .
git commit -m "feat: Implement password reset"
git push
# Railway auto-deploys
```

**Bước 7: Test Production Fix**
```
1. Test forgot password flow
2. Verify email sent
3. Click reset link
4. Set new password
5. Login with new password ✅
```

**⏰ Effort:**
- Design: 30 min
- Implement: 2 hours
- Test: 30 min
- Deploy: 5 min
- **Total: ~3 hours**

---

## ⚠️ SCENARIO 5: PHASE 8 (Frontend), Backend API Doesn't Match Expected Response

### Tình Huống
```
Frontend code:
const response = await fetch('/api/products');
const {products, total, page} = await response.json();

// Map products to JSX
{products.map(p => <ProductCard product={p} />)}

Pero API returns:
{
  products: [...],
  total: 100,
  page: 1,
  pages: 10
}

Frontend expects:
{products: [...], total: 100, page: 1}
→ Frontend crashes (page is undefined)
```

### Cách Xử Lý

**Bước 1: Identify Mismatch**
```
Frontend expects: {products, total, page}
Backend returns: {products, total, page, pages}

Mismatch: `pages` field not used by frontend
```

**Bước 2: Check API Design**
```
File: docs/API_SPEC.md

GET /api/products
Response format defined as:
{
  products: [...],
  total: number,
  page: number,
  pages: number  ← Should be here
}
```

**Bước 3: Fix Frontend**
```typescript
// Frontend code should match API design
const response = await fetch('/api/products');
const {products, total, page, pages} = await response.json();

// Use for pagination
<Pagination 
  currentPage={page}
  totalPages={pages}
  onPageChange={setPage}
/>
```

**Bước 4: Verify Communication**
```
🎯 Backend gives: {products, total, page, pages}
✅ Frontend expects: {products, total, page, pages}
→ Match!
```

**⏰ Effort:**
- Identify: 15 min
- Fix: 15 min
- Test: 15 min
- **Total: ~45 min**

---

## ⚠️ SCENARIO 6: Database Schema Change in Production

### Tình Huống
```
Website LIVE dengan 1000 products

You realize: "Products cần thêm field 'warranty'"

Problem: 
- Không thể delete database (mất dữ liệu)
- Phải migrate production database safely
```

### Cách Xử Lý

**Bước 1: BACKUP DATABASE (CRITICAL!)**
```bash
# Download backup from Railway dashboard
# OR via command line:
pg_dump -h railway.app -U postgres -d tech_store > backup_latest.sql
# Keep this file safe!
```

**Bước 2: Update Schema Locally**
```prisma
model Product {
  ...
  warranty String? // "1 year", "2 years", etc
}
```

**Bước 3: Create Migration**
```bash
npx prisma migrate dev --name add_warranty_field
# Creates migration file automatically
```

**Bước 4: Test Locally**
```bash
# Verify migration works locally
npx prisma migrate reset # ← Uses seed.ts to repopulate test data
npm run dev
# Test adding product with warranty
```

**Bước 5: Deploy to Production**
```bash
git add .
git commit -m "feat: Add warranty field to products"
git push origin main
# Railway auto-runs migration
# No downtime! (Railway handles it smoothly)
```

**Bước 6: Verify Production**
```
Railway logs should show:
✓ Migration executed successfully
✓ Column added to products table

Test in production:
- Add product with warranty
- Query product
- See warranty field ✅
```

**⏰ Effort:**
- Backup: 5 min
- Schema update: 5 min
- Create migration: 2 min
- Test local: 10 min
- Deploy: 1 min (auto)
- Verify: 5 min
- **Total: ~30 min**

**⚠️ Never:**
```
❌ Don't drop database
❌ Don't delete table
❌ Don't run raw SQL on prod
❌ Don't skip backup
→ Use Prisma migrations always!
```

---

## ⚠️ SCENARIO 7: Frontend Code PHASE 8, Realize PHASE 2 Database Index Missing

### Tình Huống
```
Frontend filtering by category: GET /api/products?category=laptop

Takes 5 seconds (unacceptable!)

You check backend: Database query is slow
Reason: No index on categoryId

PHASE 2 database design incomplete
→ Didn't add index back then
```

### Cách Xử Lý

**Bước 1: Identify Slow Query**
```
You can see in logs:
GET /api/products?category=laptop → 5000ms

This is SLOW (should be <100ms)
```

**Bước 2: Check Database**
```sql
-- Connect to database
psql -U postgres -h localhost -d tech_store

-- List indexes
SELECT * FROM pg_indexes WHERE tablename = 'products';

-- Analyze query
EXPLAIN ANALYZE 
SELECT * FROM products WHERE "categoryId" = 1;

-- Result shows: Seq Scan (full table scan) ← BAD
-- Should be: Index Scan ← GOOD
```

**Bước 3: Add Index**
```prisma
// File: prisma/schema.prisma
model Product {
  ...
  categoryId  Int?
  ...
  @@index([categoryId])  // ← ADD THIS
}
```

**Bước 4: Create Migration**
```bash
npx prisma migrate dev --name add_product_category_index
```

**Bước 5: Test Locally**
```bash
# Before: 1000ms
# After: 5ms
# ✅ 200x faster!
```

**Bước 6: Deploy**
```bash
git add .
git commit -m "perf: Add index on products.categoryId"
git push
# Railway auto-deploys
```

**Bước 7: Verify in Production**
```
GET /api/products?category=laptop
→ Now 10-20ms (from 5000ms)
✅ Problem solved!
```

**⏰ Effort:**
- Identify: 15 min
- Add index: 5 min
- Test: 10 min
- Deploy: 1 min
- **Total: ~30 min**

---

## ⚠️ SCENARIO 8: Halfway Through PHASE 8, Realize Need Changes in PHASE 1 Requirements

### Tình Huống
```
Building product list page in PHASE 8 (Frontend)

Realize: "Should products have variants (size, color)?"
→ Not defined in PHASE 1 requirements

If YES:
- Database schema needs variants table
- API needs variant handling
- Frontend needs variant selector
- Cart needs variant tracking

This is BIG change!
```

### Cách Xử Lý

**Bước 1: Decide Scope**
```
Important: Is this MUST-HAVE or SHOULD-HAVE?

For MVP (MUST-HAVE):
- Don't add variants now, ship without them

For v1.1 (SHOULD-HAVE):
- Plan for next release
- Don't block launch
```

**Bước 2: If Decision is NO (MVP without variants)**
```
[ ] Update docs/BRD.md
    PHASE 1 (MVP Features):
    - Products DON'T have variants
    - Each SKU is separate product
    
    Example: Instead of:
    - "iPhone" + variant (64GB, 128GB)
    
    Do this:
    - "iPhone 64GB" (separate product)
    - "iPhone 128GB" (separate product)

[ ] Commit and move on
    git add .
    git commit -m "clarify: No product variants in MVP"
    git push
```

**Bước 3: If Decision is YES (Add variants)**
```
⚠️ This requires changes in multiple phases!

PHASE 1 (Requirements):
[ ] Add: Product variants (size, color, storage)

PHASE 2 (Database):
[ ] Add table: ProductVariants
    CREATE TABLE product_variants (
      id SERIAL PRIMARY KEY,
      product_id INT,
      name VARCHAR(255), // "64GB", "Black", "M"
      price_delta FLOAT,
      stock INT,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

[ ] Update OrderItems:
    Add variant_id FK

PHASE 3 (API):
[ ] GET /api/products/:id
    Return: {product, variants: [{...}, {...}]}

[ ] POST /api/cart/items
    Body: {product_id, variant_id, quantity}

PHASE 4 onwards:
[ ] Update all code that references products

Cost: ~10-15 hours of work!
```

**Bước 4: Decide Carefully**
```
Question: Is MVP blocked without variants?
- NO → Add in v1.1 (don't do now)
- YES → Do now (but accept 10-15 hours delay)

Most common: Add in v1.1!
```

**Bước 5: Document Decision**
```
File: docs/BRD.md

PHASE 1 (MVP - NO variants):
- Products are fixed SKUs
- "iPhone 64GB" is one product
- "iPhone 128GB" is different product

PHASE 2 (v1.1 - WITH variants):
- Add variant support
- Let user select options at checkout
```

**⏰ Effort if added:**
- Requirement change: 30 min
- Database: 1.5 hours
- Backend API: 2-3 hours
- Frontend: 3-4 hours
- Testing: 1 hour
- **Total: ~10 hours**

**Better decision:** Add in v1.1 to ship MVP faster!

---

## 📋 QUICK REFERENCE CHECKLIST

### When You Hit a Problem, Ask These Questions:

```
1. WHICH PHASE am I in?
   [ ] PHASE 1 (Planning)
   [ ] PHASE 2 (Database)
   [ ] PHASE 3 (Server)
   [ ] PHASE 4-6 (Backend)
   [ ] PHASE 7-10 (Frontend)
   [ ] PHASE 11+ (Testing/Deploy)

2. WHICH EARLIER PHASE is incomplete/wrong?
   [ ] PHASE 1 (Requirements)
   [ ] PHASE 2 (Database Schema)
   [ ] PHASE 3 (API Design)
   [ ] Other

3. WHAT'S THE IMPACT?
   [ ] Small (< 1 hour fix)
   [ ] Medium (1-3 hours fix)
   [ ] Large (3+ hours, delay launch)

4. SHOULD I FIX NOW OR LATER?
   [ ] FIX NOW if:
       - Blocking current work
       - Easy fix (< 1 hour)
       - Part of MVP
   
   [ ] FIX LATER (v1.1) if:
       - Not blocking MVP
       - Complex fix (> 3 hours)
       - Optional feature

5. HOW DO I FIX?
   [ ] Update docs first
   [ ] Update code second
   [ ] Test third
   [ ] Deploy fourth
   [ ] Verify fifth
```

---

# 🎯 SUMMARY

**Phần 1:** Quick Reference cho mỗi PHASE
**Phần 2:** 8 Real Scenarios + solutions

Khi gặp vấn đề:
1. Tìm scenario tương tự
2. Follow bước xử lý
3. Estimate effort
4. Quyết định fix now or later

**Chúc bạn xây dựng website thành công! 🚀**
