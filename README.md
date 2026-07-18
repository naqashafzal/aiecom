# ZS Decor AI E-Commerce Platform

A next-generation, fully autonomous e-commerce platform built with **Next.js**, **Prisma**, **Tailwind CSS v4**, and heavily integrated with the **Vercel AI SDK**. 

This isn't just a standard storefront—it features an entire **AI Workforce** that helps run the business, from customer support to inventory management and marketing, plus a **Remote MCP Server** that allows native integrations with Claude.ai.

---

## 🚀 Key Features

### 🛍️ Modern Storefront
- **Blazing Fast Frontend**: Built on Next.js App Router.
- **Dynamic Cart & Checkout**: Integrated directly with Stripe for secure, frictionless payments.
- **SEO Optimized**: Fully compliant with Google Merchant Center, dynamic XML sitemaps, robots.txt, and complete Schema.org `application/ld+json` structured data.
- **Live Search**: Instant product discovery.

### 🤖 AI Workforce (Powered by Gemini 1.5 Flash)
- **The Storefront Concierge**: A highly capable customer-facing chatbot. It can search the database, recommend products, and even securely inject items directly into the user's shopping cart.
- **The AI Inventory Manager**: Select a product title, and the AI will autonomously write a high-converting, HTML-formatted product description directly inside your admin editor.
- **The AI Marketing Agent**: Give it a topic, and it will research and write a fully-formatted Markdown blog post complete with excerpts and slugs.
- **Admin Omni-Agent**: A specialized chatbot in the Admin Dashboard capable of modifying order status, checking total revenue, and updating inventory directly via tool-calling.

### 🧠 Remote MCP Server (Model Context Protocol)
This repository ships with a native **Remote MCP Server**. By connecting this web app to Claude.ai or Claude Desktop as a "Custom Connector", you grant Claude secure, native access to your database.
- **Tools Included**: `getStoreStats`, `searchProducts`, `updateProductStock`, `getRecentOrders`.
- **Protocol**: Operates over SSE (Server-Sent Events) via `/api/mcp`.

### 🛡️ Powerful Admin Dashboard
- **Bulk Order Editing**: Select multiple orders and instantly update their fulfillment or payment statuses.
- **Content Management**: Manage products, categories, blogs, and pages.
- **Role-Based Auth**: Secured via NextAuth v5 (Auth.js) with Admin/User roles.

---

## 💻 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: [Auth.js (NextAuth v5)](https://authjs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) & Radix UI
- **AI / LLMs**: [Vercel AI SDK](https://sdk.vercel.ai/docs), `@ai-sdk/google`
- **Payments**: Stripe (`@stripe/stripe-js`)

---

## ⚙️ Environment Variables

To run this project locally or in production, you must configure your `.env` file. 

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/dbname"

# Authentication (Generate with `npx auth secret`)
AUTH_SECRET="your_auth_secret_here"

# Storefront URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# AI Workforce (Required for all AI Agents to function)
GOOGLE_GENERATIVE_AI_API_KEY="your_gemini_api_key"
```

---

## 🛠️ Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aiecom
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the Database**
   Configure your `DATABASE_URL` in the `.env` file, then push the schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the storefront, and `/admin` for the backend.

---

## ☁️ Deployment

### Using Coolify / Docker
This application is container-ready. When deploying via Coolify:
1. Connect your repository.
2. Set the build command to: `prisma generate && prisma db push --accept-data-loss && next build`
3. Add all required Environment Variables in the Coolify dashboard **before** triggering the build.
4. Deploy!

### Connecting the MCP Server
Once deployed to a public URL:
1. Go to **Claude.ai** -> **Settings** -> **Connectors** -> **Add Custom Connector**.
2. Enter your deployed SSE endpoint: `https://your-domain.com/api/mcp`.
3. Claude will now have direct context of your database and can help you run your store autonomously.
