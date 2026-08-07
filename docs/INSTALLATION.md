# 🚀 Complete Installation & Deployment Guide

This guide covers everything you need to know to install, configure, and deploy the ZSDecor E-commerce platform locally and on production using Coolify.

---

## 💻 1. Local Development Setup

### Prerequisites
- Node.js 20+ installed
- PostgreSQL installed and running (or a cloud database URL like Supabase/Neon)
- Git

### Step-by-Step Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/naqashafzal/aiecom.git
   cd aiecom
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables Configuration**
   Create a `.env` file in the root directory. You MUST include these variables:
   ```env
   # Database Connection
   DATABASE_URL="postgresql://user:password@localhost:5432/zsdecor"

   # NextAuth Authentication
   AUTH_SECRET="your_super_secret_random_string_here"
   AUTH_URL="http://localhost:3000"

   # Application URL (Important for SEO and Feeds)
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # AI Integrations (Gemini / Claude)
   GOOGLE_GENERATIVE_AI_API_KEY="your_google_gemini_api_key"

   # Stripe Payments (Optional but recommended)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   ```

4. **Initialize the Database**
   Push the Prisma schema to your PostgreSQL database:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

---

## 🌍 2. Production Deployment (via Coolify)

This web application is highly optimized for Docker and Coolify. Because of Next.js Server Components and Prisma, specific build arguments must be provided during deployment.

### Step 1: Create the Application in Coolify
1. Go to your Coolify Dashboard.
2. Click **Add New Resource** -> **Application** -> **GitHub (Public/Private)**.
3. Select the `aiecom` repository and the `master` branch.
4. Set the Build Pack to **Nixpacks** or **Dockerfile** (A custom `Dockerfile` is included in the root).

### Step 2: Configure Environment Variables
In your Coolify Application settings, go to the **Environment Variables** tab. Add the following variables. **Ensure you check the "Build Variable" checkbox for all of them!**

| Variable Name | Value | Build Var |
|---------------|-------|-----------|
| `DATABASE_URL` | Your production PostgreSQL connection string | ✅ Yes |
| `AUTH_SECRET` | A secure, random 32-character string | ✅ Yes |
| `AUTH_URL` | `https://zsdecor.pk` (or your domain) | ✅ Yes |
| `NEXT_PUBLIC_APP_URL` | `https://zsdecor.pk` | ✅ Yes |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Your Gemini API Key | ✅ Yes |

### Step 3: Configure Network and Domains
1. Go to the **General / Configuration** tab.
2. Under **Domains**, it is strictly required to include both the non-www and www versions separated by a comma to prevent "no available server" errors:
   ```text
   https://zsdecor.pk,https://www.zsdecor.pk
   ```
3. Under **Ports Exposes**, verify the port is exactly:
   ```text
   3000
   ```

### Step 4: Deploy
Click the **Deploy** button. Coolify will build the Docker container.
*Note: The build process runs `prisma generate` and `next build`. This requires the Database URL to be reachable during the build phase.*

---

## ⚙️ 3. Google Merchant Center Integration

The platform automatically generates a live, optimized XML feed of your active products for Google Merchant Center. 

1. Go to Google Merchant Center -> Data Sources.
2. Choose **Add new feed** via **Scheduled Fetch**.
3. Set the File URL strictly to:
   ```text
   https://zsdecor.pk/api/feed/merchant
   ```
*(Do not use the `www` subdomain for the feed if it redirects, ensure the protocol matches your canonical domain).*

---

## ⚡ 4. Architecture & Performance Notes

- **Database Caching:** Next.js `unstable_cache` and `React.cache()` are heavily utilized across the app (especially in `layout.tsx` and `ProductClient.tsx`). Global settings are cached for 1 hour to prevent database overload.
- **Image Optimization:** All products are uploaded and served using standard URLs. It is recommended to put a CDN (like Cloudflare) in front of your domain to cache product images.
- **Sitemap:** Automatically generated at `/sitemap.xml`. It streams active products and categories efficiently.
