# Simple E-commerce Store (ShopEasy)

A clean, modern, and fully functional full-stack E-commerce web application developed for the **CodeAlpha Internship (Task 1)**.

Built with a native **HTML5, CSS3, and Vanilla JavaScript** frontend and a robust **Node.js, Express.js, and MongoDB (Mongoose)** backend.

---

## 🌟 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Technologies Used](#technologies-used)
- [Project Architecture & Structure](#project-architecture--structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Database Seeding & Test Account](#database-seeding--test-account)
- [REST API Endpoints](#rest-api-endpoints)
- [Screenshots & UI Walkthrough](#screenshots--ui-walkthrough)
- [Security & Architecture Best Practices](#security--architecture-best-practices)
- [Future Enhancements](#future-enhancements)
- [License](#license)

---

## 🛍️ Overview

**ShopEasy** is a complete, production-ready full-stack e-commerce solution engineered to deliver a seamless shopping experience for consumers and a clean, maintainable architecture for developers. It implements all core e-commerce capabilities—from product discovery and catalog filtering to cart management, user authentication, and multi-step order checkout with database persistence.

---

## ✨ Key Features

### 1. 🏠 Homepage
- Dynamic, hero showcase banner with call-to-action buttons.
- Value proposition features (Free Express Shipping, 30-Day Guarantee, Secure Checkout, 24/7 Support).
- Quick category navigation cards.
- Real-time featured product highlights pulled directly from MongoDB.

### 2. 📦 Product Catalog & Discovery
- Full responsive product grid with card hover micro-animations.
- Instant search by title, description, or category.
- Department/category filtering (`Electronics`, `Clothing`, `Shoes`, `Accessories`, `Home & Kitchen`).
- Sorting controls: Newest First, Price (Low to High), Price (High to Low), Highest Rated, and Alphabetical.
- Stock availability indicators (`In Stock`, `Only X left`, `Out of Stock`) and "In Stock Only" checkbox filter.

### 3. 🔍 Product Details Page
- High-resolution product image presentation.
- Title, rating with review counts, detailed descriptions, and category badges.
- Live warehouse inventory indicators.
- Quantity selector with strict boundary limits (preventing selection beyond current warehouse stock).
- Dynamic "Similar Items You Might Like" recommendation section.

### 4. 🛒 Interactive Shopping Cart
- LocalStorage-backed cart state with dynamic cart badge indicator across all pages.
- Add, decrease, increase, and remove items with instant subtotal and total calculations.
- Intelligent client-side inventory validation against database stock limits.
- Clear cart and "Continue Shopping" options.

### 5. 🔐 User Authentication (JWT + Bcrypt)
- User Registration with full client and server validation (name, email format regex, password minimum 6 characters, password confirmation).
- Bcrypt password hashing prior to database storage.
- User Login generating secure JSON Web Tokens (JWT).
- Protected profile and order endpoints verified via Express authentication middleware.
- Seamless "One-Click Auto-Fill Demo Credentials" button for effortless project evaluation.

### 6. 💳 Order Processing & Checkout
- Multi-step checkout modal with shipping address inputs (Full Name, Address, City, State, PIN Code, Phone).
- Simulated payment options (Cash on Delivery, Simulated Card, Simulated UPI).
- Server-side inventory recalculation and atomic stock reduction upon successful placement.
- Unique human-readable Order ID generation (`ORD-XXXXXX-XXXX`).
- Order confirmation modal with instant order receipt.

### 7. 📜 Order History ("My Orders")
- Protected user order history displaying all previous purchases for the authenticated user.
- Status badges: `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled`.
- Itemized purchase breakdown with image thumbnails, quantities, unit prices, and delivery addresses.

---

## 🛠️ Technologies Used

### Frontend
- **HTML5**: Semantic web markup.
- **CSS3**: Custom design system featuring CSS variables, modern gradients, glassmorphism, responsive grid & flexbox layouts (no heavy frameworks).
- **Vanilla JavaScript (ES6+)**: Fetch API, dynamic DOM manipulation, LocalStorage state management.

### Backend
- **Node.js**: Asynchronous event-driven runtime.
- **Express.js**: RESTful API design, routing, and static file serving.
- **CORS**: Cross-Origin Resource Sharing handling.
- **dotenv**: Environment configuration management.

### Database & Security
- **MongoDB**: NoSQL document database.
- **Mongoose**: Object Data Modeling (ODM) with schema validation and pre-save hooks.
- **bcryptjs**: Salt-hashed passwords.
- **jsonwebtoken (JWT)**: Stateless token-based user authentication.

---

## 📂 Project Architecture & Structure

```
CodeAlpha_Simple_E_Commerce_Store/
│
├── server.js               # Express application entry point & MongoDB connection
├── package.json            # NPM dependencies and run scripts
├── .env                    # Environment configuration (ignored in git)
├── .env.example            # Environment template
├── .gitignore              # Git ignored files & folders
├── README.md               # Comprehensive project documentation
│
├── models/                 # Mongoose data schemas
│   ├── User.js             # User model (name, email, password, timestamps)
│   ├── Product.js          # Product model (name, desc, price, category, stock, etc.)
│   └── Order.js            # Order model (user, items, shippingAddress, total, status)
│
├── routes/                 # Express API routes
│   ├── authRoutes.js       # Register, Login, and Profile endpoints
│   ├── productRoutes.js    # Product listing, filtering, search, and CRUD
│   └── orderRoutes.js      # Order placement and order history
│
├── middleware/             # Custom Express middleware
│   └── authMiddleware.js   # JWT authentication & route protection
│
├── seed/                   # Database seed scripts
│   └── products.js         # 18 realistic sample products across 5 categories
│
└── public/                 # Static frontend client assets
    ├── index.html          # Storefront homepage
    ├── products.html       # Product catalog with filters and search
    ├── product-details.html# Comprehensive product detail page
    ├── cart.html           # Shopping cart and checkout modal
    ├── login.html          # Sign-in page with demo auto-fill
    ├── register.html       # User account registration page
    ├── orders.html         # User order history page
    │
    ├── css/
    │   └── style.css       # Complete modern CSS design system & responsiveness
    │
    ├── js/
    │   ├── main.js         # Global auth state, navbar sync, cart helpers, toast alerts
    │   ├── auth.js         # Login and registration form handling
    │   ├── products.js     # Catalog search, filter, and sorting logic
    │   ├── product-details.js # Single product details and quantity controller
    │   ├── cart.js         # Cart rendering, qty adjustments, and checkout
    │   └── orders.js       # Order history rendering and status badges
    │
    └── images/
        └── favicon.svg     # SVG ShopEasy brand icon
```

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (Version 16.x or higher)
- [MongoDB](https://www.mongodb.com/) (Community Server running locally on port 27017 or a MongoDB Atlas URI)

---

## ⚙️ Installation & Setup

1. **Clone or Navigate to the Repository:**
   ```bash
   cd CodeAlpha_Simple_E_Commerce_Store
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   A `.env` file is included in the project root. You can customize the settings if needed:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/simple_ecommerce_store
   JWT_SECRET=shopeasy_codealpha_jwt_secret_key_2026_secure
   ```

---

## 🚀 Running the Application

### 1. Seed the Database (Optional / Automatic)
The application automatically seeds 18 sample products and a demo account upon startup if the database is empty. You can also explicitly run the seeder:
```bash
npm run seed
```

### 2. Start the Server
```bash
npm start
```

### 3. Open in Browser
Open your browser and navigate to:
```
http://localhost:5000
```

---

## 👤 Test User Credentials

To test the application quickly without registering a new account, use the pre-seeded demo account:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Demo Customer** | `demo@shopeasy.com` | `password123` |

*(You can also click the **"Auto-Fill"** button on the login page to populate these credentials automatically.)*

---

## 🔌 REST API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Create new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT |
| `GET` | `/api/auth/profile` | Private | Retrieve authenticated user profile |

### 📦 Products (`/api/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | List products (supports `search`, `category`, `sort`, `limit`) |
| `GET` | `/api/products/categories` | Public | Fetch distinct categories list |
| `GET` | `/api/products/:id` | Public | Get single product by ID |
| `POST` | `/api/products` | Public/Admin | Create a new product |
| `PUT` | `/api/products/:id` | Public/Admin | Update product details |
| `DELETE` | `/api/products/:id` | Public/Admin | Delete product from database |

### 🛍️ Orders (`/api/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Private | Place an order (validates stock, deducts inventory, saves order) |
| `GET` | `/api/orders` | Private | Get order history for authenticated user |
| `GET` | `/api/orders/:id` | Private | Get single order details (ownership protected) |

---

## 🔒 Security & Quality Measures

- **Password Hashing**: Industry-standard `bcryptjs` hashing with automated salt generation.
- **JWT Protection**: Protected routes require valid bearer tokens; unauthorized requests receive clean HTTP 401/403 responses.
- **Server-Side Stock Verification**: Product prices and inventory counts are re-verified on the server before completing orders, preventing client-side price tampering.
- **Data Integrity**: Schemas include regex checks, trimming, uniqueness indices, and stock bounds.
- **Clean Responsive UI**: Designed with high-contrast typography, mobile drawer navigation, responsive tables, and non-intrusive toast notifications.

---

## 🔮 Future Enhancements
- Integration with payment gateways (Stripe, Razorpay, or PayPal Sandbox).
- User reviews and rating submission form.
- Administrative dashboard for inventory management and order dispatch tracking.
- Email order notifications via Nodemailer.

---

## 📄 License
This project is open-source and created as part of the **CodeAlpha Full-Stack Web Development Internship**.
