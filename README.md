# ZSDecor E-commerce Platform

A modern, full-featured e-commerce platform built with Next.js, Prisma, and Tailwind CSS. It features a comprehensive storefront, an advanced admin dashboard, multi-vendor support, and a built-in AI MCP (Model Context Protocol) Server for intelligent automation.

## 🚀 Features

### 🛍️ Storefront
*   **Dynamic Theming**: Support for multiple storefront themes (e.g., Elegant, Marketplace).
*   **Product Discovery**: Live search bar, category filtering, and product recommendations (similar/bought together).
*   **Checkout System**: Secure checkout with support for Stripe, Cash on Delivery (COD), Bank Transfer, EasyPaisa, and JazzCash.
*   **Shopping Cart & Wishlist**: Persistent cart and wishlist for authenticated and guest users.
*   **Customer Accounts**: Order history, saved addresses, reward points, and recently viewed products.
*   **Product Reviews**: Customers can leave ratings and reviews (with admin moderation).

### 🛡️ Advanced Admin Dashboard
*   **Order Management**: View detailed order summaries, update fulfillment & payment statuses, and copy customer details to clipboard.
*   **Product Management**: Create, edit, and bulk-update products, stock levels, and prices.
*   **Categorization**: Manage categories and brands with nested hierarchies.
*   **Shipping Rates**: Configure dynamic shipping zones and rates based on price or weight conditions.
*   **Marketing & Discounts**: Create discount coupons (percentage, fixed, free shipping) with usage limits and expiration dates.
*   **Notifications System**: Live admin notification bell for new orders.
*   **Content Management**: Built-in blogging system and customizable pages.

### 🤖 AI Integration (MCP Server)
The platform includes a deeply integrated **Model Context Protocol (MCP)** server (`/api/mcp`) that exposes secure tools to AI assistants (like Claude Desktop). The AI can:
*   Retrieve store statistics, recent orders, and customer details.
*   Create, update, or delete products, categories, and brands.
*   Generate bulk fake reviews for testing.
*   Update order statuses and inventory stock.

### 🔔 Notifications & Emails
*   **Push Notifications**: Expo push notifications sent to admins on new orders.
*   **Emails**: Order confirmation emails powered by Resend.

## 🛠️ Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **Database ORM**: [Prisma](https://www.prisma.io/)
*   **Database**: PostgreSQL
*   **Authentication**: [NextAuth.js](https://next-auth.js.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [Radix UI](https://www.radix-ui.com/) + Lucide Icons
*   **Payments**: [Stripe](https://stripe.com/)
*   **Emails**: [Resend](https://resend.com/) + React Email
*   **State Management**: Zustand
*   **AI SDK**: `@modelcontextprotocol/sdk`, Vercel AI SDK

## 📦 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd aiecom
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and configure the following variables:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/zsdecor"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Resend (Emails)
RESEND_API_KEY="re_..."
```

### 4. Database Setup
Push the Prisma schema to your database and generate the Prisma client:
```bash
npx prisma db push
npx prisma generate
```

*(Optional)* Seed the database with initial admin users and settings if you have a seed script:
```bash
npx prisma db seed
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The Admin dashboard is accessible at `/admin`.

## 🤖 Connecting the MCP Server to Claude Desktop

You can manage this e-commerce store using Claude Desktop by connecting the built-in MCP server.

1. Open your Claude Desktop configuration file:
   * **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   * **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Add the SSE connection to the config:
```json
{
  "mcpServers": {
    "zsdecor-store": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/inspector",
        "http://localhost:3000/api/mcp"
      ]
    }
  }
}
```
*Note: Depending on how you expose SSE locally, you might write a custom script or simply use Claude's built-in fetch if it supports direct SSE URLs.*

## 📜 License
This project is proprietary and confidential.
