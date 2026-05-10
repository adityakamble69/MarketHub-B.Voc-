# 🛒 MarketHub — Multi-Vendor Marketplace

A full-stack multi-vendor e-commerce marketplace built with HTML, CSS, JavaScript, Node.js/Express, and MySQL.

---

## 📁 Project Structure

```
marketplace/
├── frontend/               # Pure HTML/CSS/JS
│   ├── index.html          # Storefront
│   ├── css/main.css        # All styles
│   ├── js/api.js           # API helper (auth, products, cart, etc.)
│   └── pages/
│       ├── login.html
│       ├── register.html
│       └── vendor-dashboard.html
│
├── backend/                # Node.js + Express REST API
│   ├── server.js           # Entry point
│   ├── package.json
│   ├── .env.example        # Copy to .env and fill in
│   ├── config/
│   │   └── db.js           # MySQL connection pool
│   ├── middleware/
│   │   └── auth.js         # JWT verify + role guard
│   └── routes/
│       ├── auth.js         # /api/auth/register, /login
│       ├── products.js     # /api/products
│       ├── orders.js       # /api/orders
│       └── vendor.js       # /api/vendor/dashboard, products, profile
│
└── database/
    └── schema.sql          # Full MySQL schema + seed data
```

---

## ⚡ Quick Start

### 1. Database Setup
```sql
-- In MySQL client:
source database/schema.sql
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials and JWT secret

npm install
npm run dev     # Runs on http://localhost:5000
```

### 3. Frontend
No build step needed! Open `frontend/index.html` directly in a browser,
or serve with a simple static server:
```bash
cd frontend
npx serve .     # or use VS Code Live Server extension
```

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/register | Public | Register buyer or vendor |
| POST | /api/auth/login | Public | Login, returns JWT |

### Products
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/products | Public | Browse with filters (category, search, price) |
| GET | /api/products/:id | Public | Product detail + reviews |
| POST | /api/products | Vendor | Create product |
| PUT | /api/products/:id | Vendor | Update own product |
| DELETE | /api/products/:id | Vendor/Admin | Delete product |

### Cart
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/cart | Buyer | Get cart items |
| POST | /api/cart | Buyer | Add/update item |
| DELETE | /api/cart/:id | Buyer | Remove item |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/orders | Buyer | Place order (clears cart) |
| GET | /api/orders | Buyer | List own orders |
| GET | /api/orders/:id | Buyer | Order detail |
| PATCH | /api/orders/:id/status | Vendor/Admin | Update status |

### Vendor
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/vendor/dashboard | Vendor | Stats + recent orders |
| GET | /api/vendor/products | Vendor | Own products list |
| PUT | /api/vendor/profile | Vendor | Update shop profile |

---

## 🚀 Roles & Access

| Role | Can Do |
|------|--------|
| **Buyer** | Browse, add to cart, place orders, write reviews |
| **Vendor** | Manage products, view orders, check earnings |
| **Admin** | Approve vendors, manage all products/orders |

---

## 🗄️ Database Tables

`users` → `vendor_profiles` → `products` → `product_images`
`users` → `cart_items` → `products`
`users` → `orders` → `order_items` → `payouts`
`users` → `reviews` → `products`
`users` ↔ `messages`

---

## 🔧 Next Steps

- [ ] Product image upload (multer → local or S3)
- [ ] Payment gateway (Razorpay/Stripe)
- [ ] Admin panel (approve vendors, disputes)
- [ ] Real-time notifications (Socket.io)
- [ ] Email notifications (Nodemailer)
- [ ] Product reviews from buyers
- [ ] Wishlist feature
- [ ] Vendor payout management
