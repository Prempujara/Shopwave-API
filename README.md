# 🌊 Shopwave API & Modern E-Commerce Platform

A production-ready, full-stack E-Commerce REST API & Storefront platform built with **Node.js, Express, TypeScript, MongoDB with Mongoose, JWT, bcrypt, and Zod validation**, paired with a **modern glassmorphic React + TypeScript UI**.

---

## 🚀 Live Services & Quick Links
- **Local Application & Storefront UI**: [http://localhost:5000](http://localhost:5000)
- **Interactive Swagger 3.0 API Docs**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🗓️ 7-Day Roadmap Feature Breakdown

| Phase | Milestone | Details |
|---|---|---|
| **Day 1** | **Setup & Users** | TypeScript setup, folder structure (`routes`, `controllers`, `models`, `middleware`), MongoDB Atlas connection with automatic in-memory fallback, `POST /api/auth/register` with `bcryptjs` password hashing. |
| **Day 2** | **Authentication & RBAC** | `POST /api/auth/login` returning JWT, `GET /api/auth/me`, JWT authentication middleware, and Role-Based Access Control (`user` and `admin`). |
| **Day 3** | **Products & Validation** | Product model with CRUD endpoints. Create, update, and delete restricted to admins. Zod schema validation middleware and centralized operational error handling. |
| **Day 4** | **Browsing & Search** | `GET /api/products` with pagination (`page`, `limit`), category filtering, price filtering (`minPrice`, `maxPrice`), sorting, and text search across product names & descriptions. |
| **Day 5** | **Cart & Orders** | Full shopping cart CRUD (`POST /api/cart`, `GET /api/cart`, `PUT /api/cart/items/:productId`, `DELETE /api/cart/items/:productId`). `POST /api/orders` to checkout, verify stock, decrement inventory, and clear cart. `GET /api/orders` for order history. |
| **Day 6** | **Quality & Documentation** | Morgan HTTP logging, complete OpenAPI/Swagger 3.0 interactive documentation at `/api-docs`. |
| **Day 7** | **Ship It & Full UI** | Production build scripts, comprehensive documentation, and a modern Vite + React + TypeScript storefront and admin dashboard. |

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript (NodeNext / ES2022)
- **Database**: MongoDB & Mongoose (supports MongoDB Atlas & automatic zero-config fallback)
- **Security**: JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS
- **Validation**: Zod schema validation
- **Documentation**: Swagger UI & OpenAPI 3.0 (`swagger-ui-express`)
- **Logging**: Morgan

### Frontend Store & Admin Client
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Icons**: Lucide Icons
- **Design System**: Glassmorphism dark-mode UI with smooth micro-interactions, responsive CSS grid, live cart calculation, and instant demo login autofill.

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Environment Configuration
Create a `.env` file in the root folder (or use defaults):
```env
PORT=5000
NODE_ENV=development
# Leave empty for zero-config in-memory MongoDB, or supply your MongoDB Atlas URI:
MONGO_URI=
JWT_SECRET=super_secret_shopwave_jwt_key_2026_dev_prod
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

### 3. Installation
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm --prefix client install
```

### 4. Running the Project
```bash
# Build the client & start the unified server
npm run build
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser!

For active frontend development:
```bash
npm run dev      # Runs backend on port 5000 with ts-node-dev
npm run client   # Runs Vite dev server on port 3000 with proxy to backend
```

---

## 🔑 Default Seed Credentials

When the database initializes, it automatically seeds sample products and the following accounts:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@shopwave.local` | `AdminPassword123!` |
| **Customer** | `customer@shopwave.local` | `CustomerPassword123!` |

*(You can also click the quick demo buttons inside the UI Sign-In dialog to autofill these credentials instantly!)*

---

## 📚 API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register a new account
- `POST /api/auth/login` - Authenticate & obtain JWT
- `GET /api/auth/me` - Get current authenticated user profile *(Private)*

### Products
- `GET /api/products` - List products (supports `page`, `limit`, `category`, `search`, `minPrice`, `maxPrice`, `sort`)
- `GET /api/products/categories/list` - Distinct product categories list
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create new product *(Admin Only)*
- `PUT /api/products/:id` - Update product *(Admin Only)*
- `DELETE /api/products/:id` - Delete product *(Admin Only)*

### Cart
- `GET /api/cart` - View user's cart *(Private)*
- `POST /api/cart` - Add product to cart *(Private)*
- `PUT /api/cart/items/:productId` - Update item quantity *(Private)*
- `DELETE /api/cart/items/:productId` - Remove item from cart *(Private)*
- `DELETE /api/cart` - Empty user's cart *(Private)*

### Orders
- `POST /api/orders` - Convert cart to order, verify stock & decrement inventory *(Private)*
- `GET /api/orders` - View user's order history *(Private)*
- `GET /api/orders/:id` - View order details *(Private)*
- `GET /api/orders/admin/all` - List all platform orders *(Admin Only)*
- `PUT /api/orders/:id/status` - Update order status *(Admin Only)*
