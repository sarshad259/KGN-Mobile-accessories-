# 🌐 KGN Accessories - Website Workflow Architecture

This document provides a comprehensive A-to-Z overview of how the entire KGN Accessories e-commerce platform functions, including both the **Customer Journey** and the **Administrator Journey**.

---

## 🛒 1. The Customer Journey (Frontend Workflow)

### 1.1 Discovery & Browsing
- **Landing Page:** Customers land on the homepage (`/`) and are presented with high-quality hero banners and a grid of "Featured Products".
- **Dynamic Categories:** Customers can filter products by clicking categories like "Cases", "Chargers", "Audio", or "Power Banks" in the Navigation Bar. These dynamically route to `/categories/[slug]`, which queries the database for products matching that exact category.
- **Product Details:** Clicking on a product opens `/products/[id]`, displaying the full description, price, star ratings, review counts, and high-resolution images.

### 1.2 Authentication
- **Sign Up / Sign In:** Customers can log in at `/login` or register at `/register`.
- **Google OAuth 2.0:** Users can instantly sign in using the **"Continue with Google"** button. This securely bypasses password creation and automatically signs them into the platform using Google Identity Services.

### 1.3 Cart & Checkout
- **Zustand Global State:** Adding items to the cart stores them securely in the browser's local state (via Zustand), ensuring the cart persists even if the user closes the tab.
- **Checkout Process:** 
  1. The user proceeds to `/checkout`.
  2. **Shipping:** The user enters their shipping address, which auto-fills their email if logged in.
  3. **Payment (Direct Transfer):** The user is provided with the official KGN Bank/EasyPaisa/JazzCash account details. They transfer the exact amount using their phone and enter the **11 or 12 digit Transaction ID (TID)** into the website to verify.
  4. **Order Placement:** The frontend sends the order details (including the TID) to the backend `POST /api/orders` route.

### 1.4 Profile & Order Tracking
- **User Dashboard:** The customer can visit their profile (`/profile`) via the top right dropdown menu.
- **Order History:** This dashboard fetches all orders linked to their account, displaying real-time statuses like `Pending Payment`, `Paid`, or `Delivered`.

---

## 👑 2. The Administrator Journey (Backend & Management)

### 2.1 Security & Access Control
- **Admin Middleware:** Certain backend routes are protected by an `admin` middleware function. Only users with `isAdmin: true` in the MongoDB database can access these endpoints.
- **Admin Dashboard:** Administrators get an exclusive "Admin Panel" link in their navigation dropdown routing to `/admin`.

### 2.2 Inventory Management (Products CRUD)
- **Adding Products:** The admin can navigate to `/admin/products` to add new inventory. They can select an existing category or create a completely **Custom Category** on the fly (e.g., "Smart Watches").
- **Real-Time Sync:** Updating a product's price, stock, or image immediately invalidates the frontend cache and updates the live store instantly.

### 2.3 Category & Collections Tracking
- **Dynamic Scanning:** The `/admin/collections` page scans the entire MongoDB database to automatically detect every unique category (including custom ones added by the admin).
- **Financial Analytics:** The system automatically calculates total products in that category, units sold, and the total revenue generated.

### 2.4 Order Fulfillment & Verification
- **Order Dashboard:** Admins navigate to `/admin/orders` to see a master list of all customer orders.
- **Payment Verification:** For "Direct Transfer" orders, the admin checks the provided **Transaction ID (TID)** against their real bank app to confirm the money arrived.
- **Delivery Status:** Once confirmed and shipped, the admin clicks **"Mark as Delivered"**. This triggers the `PUT /api/orders/:id/deliver` endpoint, which immediately updates the status on the customer's `/profile` dashboard.

---

## 🏗️ 3. Technical Architecture Summary

### Frontend (`Next.js 16` + `React 19`)
- **Routing:** App Router for server-side & static rendering.
- **Styling:** TailwindCSS 4 with custom variables for dark/light mode and premium glassmorphism.
- **State Management:** Zustand for Cart & Auth; React Query for fast data fetching and caching.

### Backend (`Node.js` + `Express`)
- **Database:** MongoDB Atlas (NoSQL) for high-speed, flexible document storage.
- **Authentication:** JWT (JSON Web Tokens) for stateless authentication.
- **Security:** `helmet`, `cors`, and `express-rate-limit` to prevent attacks, brute forcing, and DoS.

### APIs
- `GET /api/products` (Public) - Fetch catalog
- `POST /api/users/google-login` (Public) - OAuth Auth
- `POST /api/orders` (Protected) - Place order
- `GET /api/orders/myorders` (Protected) - User profile tracking
