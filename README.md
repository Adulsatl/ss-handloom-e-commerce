# 🧵 SS HandLooms m – Handloom E-Commerce Platform

An elegant and scalable **E-Commerce platform** for authentic handloom products, built with **Next.js (App Router)** and **v0.dev** for a modern, component-driven UI.  
It supports product browsing, cart management, order tracking, and online payments via **Razorpay**.

---

## 🌟 Features

- **Modern UI & UX** – Built with v0.dev (React + TailwindCSS) for a clean and responsive design.
- **Authentication** – Secure login/signup for customers.
- **Admin Panel** – Manage products, categories, and orders from `/admin`.
- **Dynamic Product Pages** – Each product has its own route and detailed view.
- **Shopping Cart & Checkout** – Add/remove items, calculate totals, and proceed to checkout.
- **Payment Gateway Integration** – Razorpay integration for smooth and secure payments.
- **Order Tracking & Confirmation** – Customers can track their order status in real time.
- **Profile Management** – Users can manage personal information and view past orders.
- **Fully Responsive** – Optimized for mobile, tablet, and desktop.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 13+ (App Router)](https://nextjs.org/docs/app)
- **Frontend UI:** [v0.dev](https://v0.dev) (React + TailwindCSS)
- **Payment Gateway:** Razorpay
- **State Management:** Context API (via `/contexts`)
- **Deployment:** [Vercel](https://vercel.com)

---

## 📂 Project Structure

```bash
.
├── app/                      # Next.js App Router pages & routes
│   ├── about/                # About page
│   ├── admin/                # Admin panel
│   ├── auth/                 # Login & Signup
│   ├── cart/                 # Shopping cart
│   ├── categories/           # Product categories
│   ├── checkout/             # Checkout flow
│   ├── contact/              # Contact page
│   ├── order-confirmation/   # Confirmation page after successful purchase
│   ├── orders/               # User orders page
│   ├── pay/                  # Payment handling
│   ├── products/             # Product listing & details
│   ├── profile/              # User profile
│   ├── test-razorpay/        # Razorpay test integration
│   ├── track/                # Order tracking
│   ├── globals.css           # Global styling
│   ├── layout.tsx            # Root layout
│   └── providers.tsx         # Context & Providers setup
├── components/               # Reusable components (Navbar, Footer, Cards)
├── contexts/                 # Global state (Cart Context, Auth Context)
├── hooks/                    # Custom React hooks
├── lib/                      # Utility functions
├── public/                   # Static assets (images, icons)
├── styles/                   # Additional style files
├── components.json           # v0.dev component configuration
├── next.config.mjs           # Next.js configuration
└── package.json              # Project dependencies

# 1. Clone the repository
git clone https://github.com/<your-username>/sshandloom.git

# 2. Navigate into the project folder
cd sshandloom

# 3. Install dependencies
npm install

# 4. Add environment variables
# Create a .env.local file in the root with:
# RAZORPAY_KEY_ID=your_key
# RAZORPAY_KEY_SECRET=your_secret

# 5. Run the development server
npm run dev

# 6. Open in browser:
http://localhost:3000
