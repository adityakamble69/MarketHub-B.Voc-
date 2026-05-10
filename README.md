# 🛒 MarketHub — Multi-Vendor Marketplace

> Ek full-stack e-commerce platform jahan multiple vendors apne products sell kar sakte hain. Buyers browse, cart, aur order kar sakte hain. Built with **HTML, CSS, JavaScript, Node.js, Express, aur SQLite**.

---

## 👨‍💻 Project Info

| Field | Detail |
|---|---|
| **Project Name** | MarketHub |
| **Type** | Multi-Vendor E-Commerce Marketplace |
| **Tech Stack** | HTML, CSS, JS, Node.js, Express, SQLite |
| **Database** | SQLite (better-sqlite3) |
| **Authentication** | JWT (JSON Web Token) |
| **Developer** | Aditya Kamble |
| **Semester** | 5th Sem |

---

## 📁 Project Structure

```
marketplace/
│
├── frontend/                        # Pure HTML + CSS + JS (No Framework)
│   ├── index.html                   # Main Storefront Page
│   ├── css/
│   │   └── main.css                 # Complete Stylesheet (Dark Theme)
│   ├── js/
│   │   └── api.js                   # API Helper (Auth, Products, Cart, Orders)
│   └── pages/
│       ├── login.html               # Login Page
│       ├── register.html            # Register Page (Buyer / Vendor)
│       ├── vendor-dashboard.html    # Vendor Dashboard
│       └── product.html             # Product Detail Page
│
├── backend/                         # Node.js + Express REST API
│   ├── server.js                    # Main Entry Point
│   ├── package.json                 # Dependencies
│   ├── .env                         # Environment Variables (Secret)
│   ├── .env.example                 # Environment Template
│   ├── config/
│   │   └── db.js                    # SQLite Database Connection
│   ├── middleware/
│   │   └── auth.js                  # JWT Auth + Role Guard
│   ├── routes/
│   │   ├── auth.js                  # Register + Login APIs
│   │   ├── products.js              # Products CRUD APIs
│   │   ├── orders.js                # Orders APIs
│   │   └── vendor.js                # Vendor Dashboard APIs
│   └── database/
│       ├── init.js                  # Auto Table Creator
│       └── marketplace.db           # SQLite Database File (auto-generated)
│
└── README.md                        # Ye file!
```

---

## ⚙️ Tech Stack

### Frontend
- **HTML5** — Page structure
- **CSS3** — Dark theme UI, responsive design
- **Vanilla JavaScript** — API calls, DOM manipulation
- **Google Fonts** — Syne + DM Sans typography

### Backend
- **Node.js** — JavaScript runtime
- **Express.js** — REST API framework
- **better-sqlite3** — SQLite database driver
- **bcryptjs** — Password hashing
- **jsonwebtoken** — JWT authentication
- **dotenv** — Environment variables
- **cors** — Cross-origin requests
- **nodemon** — Auto-restart in development

---

## 🗄️ Database Tables

```
users               — Sabhi users (buyer, vendor, admin)
vendor_profiles     — Vendor ki shop details
categories          — Product categories (Electronics, Fashion, etc.)
products            — Products listing
product_images      — Product ke photos
cart_items          — User ka cart
orders              — Placed orders
order_items         — Order ke andar products
payouts             — Vendor ko payment
reviews             — Product reviews
```

---

## 🔑 User Roles

| Role | Kya Kar Sakta Hai |
|---|---|
| **Buyer** | Browse, Search, Cart, Order, Review |
| **Vendor** | Products add/edit/delete, Orders dekhna, Dashboard |
| **Admin** | Sab manage karna, Vendor approve karna |

---

## 🚀 Installation & Setup

### Step 1 — Prerequisites

Install karo (agar nahi hai):
- [Node.js](https://nodejs.org) — LTS version
- [VS Code](https://code.visualstudio.com)
- VS Code Extension: **Live Server**

### Step 2 — Project Download

ZIP extract karo ya clone karo:
```bash
git clone <repository-url>
cd marketplace
```

### Step 3 — Backend Setup

```bash
# Backend folder mein jao
cd backend

# .env file banao
# Notepad mein kholo aur ye content daalo:
PORT=5000
JWT_SECRET=marketplace_super_secret_key_2024
JWT_EXPIRES_IN=7d
PLATFORM_FEE_PERCENT=10

# Dependencies install karo
npm install

# Server start karo
npm run dev
```

Terminal mein ye dikhna chahiye:
```
✅ All tables created + categories seeded!
✅ SQLite connected!
🚀 Server running on http://localhost:5000
```

### Step 4 — Frontend Chalao

VS Code mein `frontend/index.html` kholo → Right Click → **"Open with Live Server"**

Browser mein open hoga:
```
http://127.0.0.1:5500/index.html
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access | Kya Karta Hai |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Naya account banao |
| POST | `/api/auth/login` | Public | Login karo, JWT milega |

### Products
| Method | Endpoint | Access | Kya Karta Hai |
|---|---|---|---|
| GET | `/api/products` | Public | Sab products dekho (filter, search) |
| GET | `/api/products/:id` | Public | Ek product ki detail |
| POST | `/api/products` | Vendor | Naya product add karo |
| PUT | `/api/products/:id` | Vendor | Product update karo |
| DELETE | `/api/products/:id` | Vendor/Admin | Product delete karo |

### Cart
| Method | Endpoint | Access | Kya Karta Hai |
|---|---|---|---|
| GET | `/api/cart` | Buyer | Cart dekho |
| POST | `/api/cart` | Buyer | Cart mein add karo |
| DELETE | `/api/cart/:id` | Buyer | Cart se hatao |

### Orders
| Method | Endpoint | Access | Kya Karta Hai |
|---|---|---|---|
| POST | `/api/orders` | Buyer | Order place karo |
| GET | `/api/orders` | Buyer | Apne orders dekho |
| GET | `/api/orders/:id` | Buyer | Order detail |
| PATCH | `/api/orders/:id/status` | Vendor/Admin | Status update karo |

### Vendor
| Method | Endpoint | Access | Kya Karta Hai |
|---|---|---|---|
| GET | `/api/vendor/dashboard` | Vendor | Stats + recent orders |
| GET | `/api/vendor/products` | Vendor | Apne products |
| PUT | `/api/vendor/profile` | Vendor | Shop profile update |

---

## 🧪 Testing — Is Order Mein Karo

```
1. Register karo → Vendor account (pages/register.html)
2. Vendor Dashboard → Product add karo
3. Logout karo
4. Register karo → Buyer account
5. Products browse karo → Cart mein add karo
6. Order place karo
```

---

## 🔐 Security Features

- Passwords **bcrypt** se hash hote hain (12 rounds)
- **JWT tokens** se authentication hoti hai
- **Role-based access control** — har route pe guard lagaya hai
- **SQL Injection** safe — prepared statements use kiye hain
- **CORS** enabled for frontend-backend communication

---

## 🔮 Future Features (Aage Add Kar Sakte Ho)

- [ ] Product image upload (Multer)
- [ ] Payment gateway (Razorpay)
- [ ] Admin panel — vendor approve, disputes
- [ ] Real-time notifications (Socket.io)
- [ ] Email confirmation (Nodemailer)
- [ ] Product search with filters (advanced)
- [ ] Wishlist feature
- [ ] Order tracking with map
- [ ] Mobile responsive improvements
- [ ] PWA support

---

## 🐛 Common Errors & Fix

| Error | Fix |
|---|---|
| `npm not recognized` | Node.js reinstall karo, PATH check karo |
| `secretOrPrivateKey must have a value` | `.env` file mein `JWT_SECRET` add karo |
| `db.query is not a function` | Routes ko SQLite style mein update karo |
| `Cannot connect to database` | `better-sqlite3` install karo: `npm install better-sqlite3` |
| Port 5000 already in use | `.env` mein `PORT=5001` karo |

---

## 📞 Contact

**Developer:** Aditya Kamble
**Email:** adityakamble692006@gmail.com
**Project:** 5th Semester Web Development Project

---

> 💡 **Note:** Ye project educational purpose ke liye banaya gaya hai. Production mein use karne ke liye security aur performance improvements zaruri hain.
